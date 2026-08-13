# Connect to BHSA with Text Fabric
# (TO SET UP A VIRTUAL ENVIRONMENT: source .venv/bin/activate)
from utils import get_passage
import time
import json

# convert the returned vale from get_passage to a string for LLM usage
# "".join(str(get_passage("Genesis", 1, 1, 31)).split())

# STEP 1 - Get characters + references 
# Format these two into usable data for get_passage()
with open("./data/characters.json", "r", encoding="utf-8") as file:
  characters = json.load(file)

arguments = {}
for character in characters["characters"]:

	if arguments.get(character["char_code"]) is None:
		arguments[character["char_code"]] = []

	for passage in character["passages"]:
		if passage not in arguments[character["char_code"]]:
			book, chapter, verse_span = passage.split(":")
			start_verse, end_verse = verse_span.split("-") if "-" in verse_span else (verse_span, None)

			arguments[character["char_code"]].append({
				"book": book,
				"chapter": int(chapter),
				"start_verse": int(start_verse),
				"end_verse": int(end_verse) if end_verse is not None else None,
			})

# Step 2 - Retrieve passages from BHSA
# Organized by character code to ensure later usability
passages = {}
for char_code, char_passages in arguments.items():
	for passage in char_passages:
		book = passage["book"]
		chapter = passage["chapter"]
		start_verse = passage["start_verse"]
		end_verse = passage["end_verse"]

		passage_data = get_passage(book, chapter, start_verse, end_verse)

		if passages.get(char_code) is None:
			passages[char_code] = []
		passages[char_code].extend(passage_data)

# Step 3 - JSON this fools
with open("./data/passages.json", "w", encoding="utf-8") as file:
	json.dump(passages, file, ensure_ascii=False, indent=2)
