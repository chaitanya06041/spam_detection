import os
from flask import Flask, request, jsonify
import pickle
import nltk
from nltk.corpus import stopwords
from nltk.stem.porter import PorterStemmer
import string
import pandas as pd
from flask_cors import CORS
from twilio.rest import Client
from dotenv import load_dotenv
import imaplib
import email
import json
import google.generativeai as genai
import csv

app = Flask(__name__)
CORS(app)
ps = PorterStemmer()

# Define path to the React `data.csv`
CSV_PATH = "../spam_react/src/Data/data.csv"
USER_DATA_CSV = "userdata.csv"
# Load models
vectorizer = pickle.load(open("./models/vectorizer.pkl", "rb"))
model = pickle.load(open("./models/model.pkl", "rb"))

# genai.configure(api_key="AIzaSyBySipMuOdjgds4WqrYyGCv65afZYMH0xg")

TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_WHATSAPP_NUMBER = os.getenv("TWILIO_WHATSAPP_NUMBER")
TO_WHATSAPP_NUMBER = os.getenv("TO_WHATSAPP_NUMBER")
client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

def send_whatsapp_message(message):
    client.messages.create(
        body=message,
        from_=TWILIO_WHATSAPP_NUMBER,
        to=TO_WHATSAPP_NUMBER
    )
    print("Whatsapp message sent to ")
    print(TO_WHATSAPP_NUMBER)

def format_response(res):
    res = res.replace("```json", "").replace("```", "").strip()
    response_dict = json.loads(res)
    return {
            "classification": response_dict.get("spam") or response_dict.get("spam_or_not"),
            "spam_words": response_dict.get("keywords", "N/A"),
            "suggestion": response_dict.get("action", "N/A"),
            "category": response_dict.get("category", "N/A")
        }

def analyze_text(text):
  prompt = f"""
    Analyze the following message for spam detection:
    1. Is it spam or not? (Answer 'Spam' or 'Not Spam')
    2. If spam, list key words responsible for classification
    3. If spam, suggest if it is fraud/fishing or suggest to block or suggest to reply not interested.
    4. If not spam, categorize it as 'Personal' or 'Work'.
    return response in json format
    Message: "{text}"
    """
  model = genai.GenerativeModel("gemini-1.5-flash-latest")
  response = model.generate_content(prompt)
  return format_response(response.text)


def check_for_common_in_spam(text):
    df = pd.read_csv('./common_words.csv')
    word_set = set(df['Word'].astype(str))
    set_to_return = set([])
    text = transform_text(text).split(" ")
    for word in text:
        if word in word_set:
            set_to_return.add(word)
    return list(set_to_return)



def transform_text(text):
    text = text.lower()
    text = nltk.word_tokenize(text)
    
    y = [i for i in text if i.isalnum()]
    y = [i for i in y if i not in stopwords.words('english') and i not in string.punctuation]
    y = [ps.stem(i) for i in y]
    
    return " ".join(y)

def save_to_csv(text, label, category):
    # Ensure the `data` directory exists
    os.makedirs(os.path.dirname(CSV_PATH), exist_ok=True)

    # Create dataframe
    new_data = pd.DataFrame([[text, label, category]], columns=["message", "label", "category"])

    # Append or create new CSV
    if os.path.exists(CSV_PATH):
        new_data.to_csv(CSV_PATH, mode="a", header=False, index=False)
    else:
        new_data.to_csv(CSV_PATH, index=False)


@app.route("/predict", methods=["POST"])
def predict():
    print("Requested Spam")
    data = request.json
    text = data["text"]
    transformed_text = transform_text(text)
    vectorized_text = vectorizer.transform([transformed_text]).toarray()
    prediction = model.predict(vectorized_text)
    
    label = "spam" if prediction[0] == 1 else "not spam"
    # Save message and label to CSV
    spam_status = "🚨 Spam Detected!" if prediction[0] == 1 else "✅ Not Spam"

    gemini_response = analyze_text(transformed_text)
    print(gemini_response)
    category = gemini_response["category"]
    if not category or category == 'N/A':
        category = "None"
    print("category is: ", category)
    save_to_csv(text, label, category)
    # Send WhatsApp message
    # send_whatsapp_message(f"Message: {text}\nStatus: {spam_status}")
    if (label == 'spam'):
        return jsonify({
            "naive" : {
            "spam": bool(prediction[0] == 1),
            "words": check_for_common_in_spam(text)
            }, 
                "gemini" : gemini_response
            })  # ✅ Convert NumPy bool_ to Python bool
    else:
        return jsonify({
            "naive" : {
            "spam": bool(prediction[0] == 1),
            "words": []
            }, 
                "gemini" : gemini_response
            })  # ✅ Convert NumPy bool_ to Python bool


@app.route('/fetch-email', methods=["POST"])
def fetch_email():
    num_emails = 5
    print("fetching emails")
    user = "spam.detection.viit@gmail.com"
    password = "hmsfwdibjfdchvik"
    imap_url = 'imap.gmail.com'
    my_mail = imaplib.IMAP4_SSL(imap_url)
    my_mail.login(user, password)
    my_mail.select('Inbox')

    # Search for all emails
    _, data = my_mail.search(None, "ALL")
    mail_id_list = data[0].split()

    # Get the latest `num_emails`
    latest_mails = mail_id_list[-num_emails:]

    emails_data = []  # List to store email details

    # Fetch emails
    for num in latest_mails:
        _, data = my_mail.fetch(num, '(RFC822)')
        for response_part in data:
            if isinstance(response_part, tuple):
                my_msg = email.message_from_bytes(response_part[1])

                # Extract subject, sender, and body
                email_info = {
                    "subject": my_msg["subject"],
                    "from": my_msg["from"],
                    "body": ""
                }

                # Extract email body
                for part in my_msg.walk():
                    if part.get_content_type() == "text/plain":
                        email_info["body"] = part.get_payload(decode=True).decode('utf-8', errors="ignore")

                emails_data.append(email_info)

    # Logout and close connection
    my_mail.logout()

    # Return JSON
    return json.dumps(emails_data, indent=4)  # Pretty-print JSON





@app.route("/history", methods=["GET"])
def get_history():
    try:
        df = pd.read_csv(CSV_PATH)  # Ensure the correct path
        return jsonify(df.to_dict(orient="records"))  # Convert to JSON format
    except Exception as e:
        print("Error getting file")
        return jsonify({"error": str(e)}), 500

@app.route("/graphs", methods=["GET"])
def get_graphs():
    try:
        df = pd.read_csv(CSV_PATH)  # Ensure the correct path
        filtered_df = df[['label', 'category']]
        return jsonify(filtered_df.to_dict(orient="records"))  # Convert to JSON format
    except Exception as e:
        print("Error getting file")
        return jsonify({"error": str(e)}), 500
    
@app.route("/clear-history", methods=["DELETE"])
def clear_history():
    if os.path.exists(CSV_PATH):
        with open(CSV_PATH, "w", newline="") as file:
            file.write("message,label,category\n")  # Clear the file contents
    return jsonify({"message": "History cleared successfully"}), 200
    

@app.route('/signup', methods=["POST"])
def signup():
    data = request.json
    email = data.get("email")
    password = data.get("password")
    app_password = data.get("app_password")
    if not email or not password or not app_password:
        return jsonify({"error": "All fields are required"})
    user_exists = False
    if os.path.exists(USER_DATA_CSV):
        with open(USER_DATA_CSV, mode="r", newline="") as file:
            reader = csv.reader(file)
            for row in reader:
                if row and row[0] == email:  # Check if email already exists
                    user_exists = True
                    break
    if user_exists:
        return jsonify({"error": "user_exists"})
    with open(USER_DATA_CSV, mode="a", newline="") as file:
        writer = csv.writer(file)
        writer.writerow([email, password, app_password])
    return jsonify({"message": "success"})

@app.route('/login', methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")
    if not email or not password:
        return jsonify({"message": "fill_all_fields"})
    
    user_found = False
    user_data = None
    if os.path.exists(USER_DATA_CSV):
        with open(USER_DATA_CSV, mode="r", newline="") as file:
            reader = csv.reader(file)
            for row in reader:
                if row and row[0] == email:
                    user_found = True
                    if row[1] == password:
                        user_data = row
                    break
    if(user_data):
        print(user_data)
        return jsonify({"message":"success"})
    if(user_found):
        return jsonify({"message": "wrong_password"})
    return jsonify({"message":"user_not_found"})

if __name__ == "__main__":
    app.run(debug=True)
