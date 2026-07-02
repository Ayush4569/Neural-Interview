# The STT Flow
 - Audio is recorded using browser native SpeechRecognition API, which converts speech to text in real-time. This text is considered as the answer for a given question.

# The TTS Flow
 - The text answer is then sent to the backend, where the controllers and gemini orchestration come into play. The backend processes the text answer, generates a reply or follow-up question using gemini service, and sends it back to the frontend.
 - The frontend receives the response from the backend and make an other request to the server /TTS endpoint which leverages deepram to convert the text response into speech. The generated audio is then played back to the user, completing the TTS flow.

 <!-- // Can you explain why you choose javascript over other kanguage -->
 # The ideal interview loop becomes, user joins the interview , backend creates the question sends it to frontend, and frontend make an api request to tts endpoint to convert the question into speech and play it to the user, then user answers the question using speech which is converted to text using STT, then the text answer is sent to backend for processing and generating a response, which is then converted to speech and played back to the user. This loop continues until the interview is complete.
 