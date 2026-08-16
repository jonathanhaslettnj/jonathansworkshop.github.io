import json
import re

# BibleWorks-style abbreviations → full book names
BOOK_MAP = {
    "Gen": "Genesis", "Exo": "Exodus", "Lev": "Leviticus", "Num": "Numbers",
    "Deu": "Deuteronomy", "Jos": "Joshua", "Jdg": "Judges", "Rut": "Ruth",
    "1Sa": "1 Samuel", "2Sa": "2 Samuel", "1Ki": "1 Kings", "2Ki": "2 Kings",
    "1Ch": "1 Chronicles", "2Ch": "2 Chronicles", "Ezr": "Ezra", "Neh": "Nehemiah",
    "Est": "Esther", "Job": "Job", "Psa": "Psalms", "Pro": "Proverbs",
    "Ecc": "Ecclesiastes", "Son": "Song of Songs", "Isa": "Isaiah",
    "Jer": "Jeremiah", "Lam": "Lamentations", "Eze": "Ezekiel", "Dan": "Daniel",
    "Hos": "Hosea", "Joe": "Joel", "Amo": "Amos", "Oba": "Obadiah",
    "Jon": "Jonah", "Mic": "Micah", "Nah": "Nahum", "Hab": "Habakkuk",
    "Zep": "Zephaniah", "Hag": "Haggai", "Zec": "Zechariah", "Mal": "Malachi",
    "Mat": "Matthew", "Mar": "Mark", "Luk": "Luke", "Joh": "John",
    "Act": "Acts", "Rom": "Romans", "1Co": "1 Corinthians", "2Co": "2 Corinthians",
    "Gal": "Galatians", "Eph": "Ephesians", "Phi": "Philippians", "Col": "Colossians",
    "1Th": "1 Thessalonians", "2Th": "2 Thessalonians", "1Ti": "1 Timothy",
    "2Ti": "2 Timothy", "Tit": "Titus", "Phm": "Philemon", "Heb": "Hebrews",
    "Jam": "James", "1Pe": "1 Peter", "2Pe": "2 Peter", "1Jo": "1 John",
    "2Jo": "2 John", "3Jo": "3 John", "Jud": "Jude", "Rev": "Revelation"
}

# Matches: Gen 1:1 In the beginning...
LINE_REGEX = re.compile(r'^([1-3]?[A-Za-z]{2,3})\s+(\d+):(\d+)\s+(.*)$')

def parse_kjv_file(filename):
    kjv = {}

    with open(filename, "r", encoding="utf-8") as f:
        for raw in f:
            line = raw.strip()
            if not line:
                continue

            match = LINE_REGEX.match(line)
            if not match:
                continue

            abbrev, chapter, verse, text = match.groups()

            if abbrev not in BOOK_MAP:
                continue

            book = BOOK_MAP[abbrev]
            key = f"{book} {chapter}:{verse}"

            kjv[key] = text.strip()

    return kjv

if __name__ == "__main__":
    input_file = "kjv.txt"
    output_file = "kjv.json"

    kjv_dict = parse_kjv_file(input_file)

    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(kjv_dict, f, indent=2, ensure_ascii=False)

    print(f"Created {output_file} with {len(kjv_dict)} verses.")
