import os
from langchain_cohere import ChatCohere
from langchain_community.tools.tavily_search import TavilySearchResults
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
import re

# Tavily Search Tool Setup
internet_search = TavilySearchResults()
internet_search.name = "internet_search"
internet_search.description = "Returns a list of relevant document snippets for a textual query retrieved from the internet."

# Initialize Cohere LLM
llm = ChatCohere(
    cohere_api_key=os.getenv("COHERE_API_KEY"),
    model="command-r-plus",
    temperature=0.3
)

# Tavily Search Helper
def search_online(query):
    return internet_search.invoke({"query": query})

# Manually Maintain Memory
messages = [
    SystemMessage(content="""
## Task and Context
You are a supportive career coach specializing in women's empowerment. 
You assist with interview prep, salary negotiation, career transitions, confidence-building, and provide factual and motivational responses.
You prefer referencing trusted sources like Lean In, Women Who Code, SheThePeople, Fairygodboss, LinkedIn Career Blogs.
Use the internet_search tool if you need updated or external information.
Stay respectful, empowering, factual, motivational. NEVER create toxic, biased, or negative content.
""")
]

# Start Conversation
print("🌟 Welcome to the Women Empowerment Career Coach! 🌟")
user_id = input("Before we start, please enter your name or ID: ")
print(f"Hello {user_id}! How can I help you today?\n")

while True:
    user_input = input("You: ")
    if user_input.lower() in ["exit", "quit"]:
        print("\nBot: It was wonderful chatting with you. Best of luck on your career journey! 🌟\n")
        break

    # Add HumanMessage manually
    messages.append(HumanMessage(content=user_input))

    try:
        # Step 1: Let the model "think"
        response = llm.invoke(messages)
        model_reply = response.content.strip()

        print(f"\n🤔 Bot (thinking): {model_reply}\n")

        # Step 2: Check if model wants to search
        search_match = re.search(r"Action:\s*Search\[(.*?)\]", model_reply, re.IGNORECASE)

        if search_match:
            search_query = search_match.group(1)
            print(f"🔎 Bot decided to search for: {search_query}\n")

            # Perform search
            try:
                search_results = search_online(search_query)
                snippets = "\n".join([doc.metadata['snippet'] for doc in search_results])

                # Feed search results back
                search_context = f"Here are search results for '{search_query}':\n{snippets}\n\nUse this to answer properly."
                messages.append(HumanMessage(content=search_context))

                # Rerun model with updated messages
                response = llm.invoke(messages)
                model_reply = response.content.strip()

            except Exception as e:
                model_reply = f"Sorry, I tried to search for you but something went wrong. Error: {str(e)}"

        # Step 3: Show the bot's final message
        print(f"\nBot: {model_reply}\n")

        # Add AIMessage manually
        messages.append(AIMessage(content=model_reply))

    except Exception as e:
        print(f"\nBot: Sorry, something went wrong. Error: {str(e)}\n")
