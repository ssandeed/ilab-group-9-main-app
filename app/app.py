import os

from flask import Flask, request, jsonify
from flask import Flask, render_template, request
from openai import OpenAI
import xml.etree.ElementTree as ET
from langchain import PromptTemplate
from langchain.chains import LLMChain
from langchain.chat_models import ChatOpenAI

import logging

logging.basicConfig(level=logging.INFO)

def get_query_from_question(question, openai_api_key):

    system_message_2 = "As a patient seeking medical advice, your aim is to communicate your symptoms and concerns clearly to the doctor. After the doctor explains, you assess their performance. Look for accurate guidance, detailed explanations, and understanding of lifestyle changes. Observe their demeanor, friendliness, and overall sentiment. Provide honest and constructive feedback, focusing on strengths and areas for improvement.Assess the doctor's knowledge by evaluating their ability to accurately help the patients with their concerns, provide detailed information about the discomfort, and demonstrate understanding of lifestyle modifications. Observe their mannerism to determine if they are respectful, attentive, and maintain a professional demeanor during the conversation. Assess their friendliness by evaluating their communication style, approachability, and willingness to address your concerns or questions. Lastly, critically evaluate the doctor's sentiment by assessing their tone, demeanor, and level of engagement. Consider whether they convey positivity, enthusiasm, and sincerity in their interactions, or if they appear disinterested or indifferent. Based on these factors, provide constructive feedback to the doctor, highlighting areas of strength and potential areas for improvement in their performance. Do not exceed more than 40 words. Don't be too nice or too harsh. Be honest and professional."

    """Get a query from a question"""
    template = """As a patient seeking medical advice, your aim is to communicate your symptoms and concerns clearly to the doctor. After the doctor explains, you assess their performance. Look for accurate guidance, detailed explanations, and understanding of lifestyle changes. Observe their demeanor, friendliness, and overall sentiment. Provide honest and constructive feedback, focusing on strengths and areas for improvement.Assess the doctor's knowledge by evaluating their ability to accurately help the patients with their concerns, provide detailed information about the discomfort, and demonstrate understanding of lifestyle modifications. Observe their mannerism to determine if they are respectful, attentive, and maintain a professional demeanor during the conversation. Assess their friendliness by evaluating their communication style, approachability, and willingness to address your concerns or questions. Lastly, critically evaluate the doctor's sentiment by assessing their tone, demeanor, and level of engagement. Consider whether they convey positivity, enthusiasm, and sincerity in their interactions, or if they appear disinterested or indifferent. Based on these factors, provide constructive feedback to the doctor, highlighting areas of strength and potential areas for improvement in their performance. Do not exceed more than 40 words. Don't be too nice or too harsh. Be honest and professional.
    
    Doctor: "It happens. You'll be okay"
    Analysis: "The doctor's approach is normalising and reassuring, attempting to reduce patient anxiety by suggesting the issue is common. However, it's slightly dismissive, lacking in empathy, which might not fully comfort some patients"

    Doctor: "I am bit concerned for you but don't worry, I am here to help you out"
    Analysis: "The doctor expresses concern and empathy, followed by reassurance and a promise of support. This approach enhances patient trust and comfort, effectively supporting the patient's emotional needs."

    Doctor: "Let's take it one step at a time. We'll tackle this together."  
    Analysis: This response is encouraging and fosters a sense of teamwork between the doctor and the patient. By emphasising collaboration, it assures the patient that they are not alone in their journey, which can be very comforting and empowering.

    Doctor: "This is a serious condition and we must address it immediately."    
    Analysis: The doctor communicates the severity and urgency of the situation clearly and directly. This approach is important for ensuring the patient understands the seriousness of their condition, although it could potentially increase anxiety without immediate reassurance and a clear plan of action.

    Doctor: "I know this might be hard to hear, but I want you to have all the information."  
    Analysis: This response demonstrates transparency and empathy. The doctor prepares the patient emotionally before delivering potentially difficult news, which can help build trust and make the patient feel valued and respected.
    
    Doctor: "I've seen many cases like yours, and I'm optimistic about your prognosis."  
    Analysis: The doctor uses their experience to reassure the patient, providing hope and optimism about the treatment outcomes. This can help alleviate fears and build confidence in the treatment plan.
    
    Doctor: "We have several options; let's explore what feels right for you."   
    Analysis: By highlighting multiple treatment options and involving the patient in decision-making, this response empowers the patient and respects their autonomy. It's patient-centred and shows flexibility in approach, which can greatly enhance patient satisfaction and engagement in their care.

    Doctor: "You're worrying too much; it's not that big of a deal."
    Analysis: This response is dismissive and minimises the patient's concerns, making the patient feel misunderstood or trivialised. Such a response will likely erode trust and discourage the patient from sharing further concerns.

    Doctor: "Well, that's rare, I have hardly seen cases like this before."
    Analysis: The doctor's expression of surprise and lack of familiarity with the condition might make the patient feel more anxious and isolated. This odd response fails to reassure or support the patient and might lead to increased worry about their condition.

    Doctor: "Let's hope for the best; sometimes, that’s all we can do."
    Analysis: This response comes across as odd and overly fatalistic, suggesting a lack of proactive options or strategies. It provides little concrete reassurance or support, potentially leaving the patient feeling hopeless and passive about their situation.

    Doctor: "Honestly, I don't know what this could be; it’s a puzzle to me too."
    Analysis: Although honesty is important, expressing it in this way may be perceived as unprofessional and can significantly undermine the patient's confidence in the doctor's capability. This kind of odd response might alarm the patient and contribute to insecurity regarding their health care.

    Doctor: "Other patients have it worse, you should feel lucky."
    Analysis: Comparing the patient’s condition negatively with others is inconsiderate and diminishes the patient's personal experience and feelings. This response is likely to be perceived as insensitive and can alienate the patient, possibly deterring them from feeling comfortable to discuss their health openly.

    Doctor: "Please take this medication and see how you feel in a week."
    Analysis: This response is straightforward, focusing on immediate treatment without emotional engagement or additional support. It's neutral as it neither addresses the patient’s emotional state nor provides significant reassurance or concern.

    Doctor: "We'll need to run some tests to determine what's wrong."
    Analysis: The doctor provides a procedural response that is fact-based and focused on the next steps. It is neutral because it lacks any emotional undertone, focusing solely on the practical aspects of diagnosis without expressing concern or reassurance.

    Doctor: "It's too early to say anything definitive; we'll monitor your condition."
    Analysis: The response is cautious and avoids speculation, focusing on monitoring rather than immediate action or reassurance. It’s neutral because it neither alarms nor comforts the patient, maintaining a professional distance.

    Doctor: "{question}"
    Analysis: """
    prompt = PromptTemplate(template=template, input_variables=["question"])
    print("Prompt:", prompt)
    llm_chain = LLMChain(prompt=prompt, llm=ChatOpenAI(model_name="gpt-4-0125-preview", openai_api_key=openai_api_key))
    query = llm_chain.run(question)
    return query



def generate_summary(messages):
    system_message_1 = "Generate a precise summary of the conversation between the doctor and the patient. Highlight the key points, important details, and any relevant information discussed during the conversation. The summary should be concise, clear, and accurately reflect the main topics covered in the conversation. Do not exceed more than 100 words."
    sytem_messages_1=[
        { "role": "system",
         "content": system_message_1},

            ]
    messages.extend(sytem_messages_1) 
    if len(messages) > 5:
        client = OpenAI(
            api_key="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",
        )
        response = client.chat.completions.create(
            messages=messages,
            model="gpt-4-0125-preview",
        )
        return response.choices[0].message.content
    else:
        return None

""" Flask setup """  
app = Flask(__name__)


@app.route('/')
def home():
    return render_template('home.html')

@app.route('/index')
def chatbot():
    return render_template('index.html')


@app.route('/api/chat', methods=['GET', 'POST'])
def chat():
    print("This method is called")
    if request.method == "POST":
        logging.info(request.headers.get("Referer"))
        args = request.get_json()

    
        question, messages_1 = args.get('question'), args.get('messages')
        #messages_2 = messages_1.copy()
        messages_1.append({"role": "user",
                          "content": question})
        
        #messages_2.append({"role": "user",
         #                 "content": question})
      
        # system_message_1 = "You are a doctor reviewing the new hypertension guidelines with a pharmaceutical Medical Science Liaison (MSL). Your goal is to ask follow-up questions to gather more information about the guidelines, medications, lifestyle modifications, and any other relevant details."
        system_message_1 = "You are a patient discussing chest pain and associated symptoms with your doctor. Your goal is to ask follow-up questions to gather more information and gauge the conversation with the doctor."
        #system_message_2 = "You are a doctor reviewing the new hypertension guidelines with a pharmaceutical Medical Science Liaison (MSL). After the MSL finishes explaining the guidelines and medications, you take a moment to assess their performance. Consider their level of knowledge, mannerism, customer-friendliness, and overall sentiment throughout the discussion. Then, provide feedback based on your observations.Assess the representative's knowledge by evaluating their ability to explain the guidelines accurately, provide detailed information about medications, and demonstrate understanding of lifestyle modifications. Observe their mannerism to determine if they are respectful, attentive, and maintain a professional demeanor during the conversation. Assess their customer-friendliness by evaluating their communication style, approachability, and willingness to address your concerns or questions.Lastly, critically evaluate the representative's sentiment by assessing their tone, demeanor, and level of engagement. Consider whether they convey positivity, enthusiasm, and sincerity in their interactions, or if they appear disinterested or indifferent.Based on these factors, provide constructive feedback to the representative, highlighting areas of strength and potential areas for improvement in their performance. Do not exceed more than 40 words. Don't be too nice or too harsh. Be honest and professional."
        
        sytem_messages_1=[
    
        { "role": "system",
         "content": system_message_1},

            ]
        # sytem_messages_2=[
    
        # { "role": "system",
        #  "content": system_message_2},

        #     ]
        
        messages_1.extend(sytem_messages_1) 
        #messages_2.extend(sytem_messages_2)

        print("Chat history after appending user input:", messages_1)
        client = OpenAI(
    # This is the default and can be omitted
    api_key="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",
)
        response = client.chat.completions.create(
        messages=messages_1,
        # model="ft:gpt-3.5-turbo-1106:e-media-corporation-pty-ltd::8wKlruVa",
        model="ft:gpt-3.5-turbo-1106:e-media-corporation-pty-ltd::9IVLOblu",
    )   
        
        #response_message = response['choices'][0]['message']
      
        resp= response.choices[0].message.content

    #     response_2 = client.chat.completions.create(
    #     messages=messages_2,
    #     model="gpt-4-0125-preview",
    # )   
        
        #response_message = response['choices'][0]['message']
        print("Print response_message #1:", response.choices[0].message.content)
        #print("Print response_message #1:", response_2.choices[0].message.content)
        resp= response.choices[0].message.content
        openai_api_key='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'
        #resp_2= response_2.choices[0].message.content
        resp_2 =  get_query_from_question(question, openai_api_key)
        summary = None 
        if len(messages_1) > 5:
            summary = generate_summary(messages_1)
        

        uiresponse = {"answer": resp, "sentiment_response": resp_2, "summary": summary}

        return uiresponse, 200

   

    if request.method == "GET":
        response = {'data': "GPSee chat API reached!"}
        return response, 200


if __name__ == "__main__":
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=True, host='0.0.0.0', port=port)