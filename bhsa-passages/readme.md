## Steps to Completion
1. Retrieve passages required to place in passages.json (excel file)
  - BHSA, gloss, morphology
  - Organize by people !!! Should I create a persons.json file?

2. Create prompts.json file to prepare for prompting
3. Connect to Claude API => Run prompts for Delilah and Women of Minoah
4. Show results to Dr. Lori Denning PhD

## FK keys to connect different files
1. DB prompt + passages

## Tools for use
1. Web Interface for Lori + Other Academics to view.
2. Statistics to view findings?
3. A database to look through all prompts made, etc.

## Cost predictions
x = times a prompt is run
y = tokens consumed by prompt
t = ppt (price per token)
q = ty

Cached cost: (t = 0.1)
1.25q + qx = $

Uncached cost: (t = 1)
qx = $

Genesis 1 - Possible pricing demonstration
- Generic                   => tokens: 56,841 | uncached: $0.170 | cached: $0.017
- Remove Unnecessary Text   => tokens: 40,504 | uncached: $0.120 | cached: $0.012
- Remove White Space        => tokens: 32,343 | uncached: $0.097 | cached: $0.0097
- Efficient Naming          => tokens: 30,261 | uncached: $0.090 | cached: $0.00907

- Total Tokens Saved: 26,580 (47%)
- Total Money Saved:  $0.16093 (94.66%)
- Cost For Query:     $.17 * 1230 = $209 ===> $.00907 * 1230 = $11.15


# Json property naming conventions
- f: reference
- h: hebrew
- w: words
- s: surface
- g: gloss
- m: morphology
  - p: Part of Speech
  - o: Part of Speech (display/predicate category)
  - v: Verbal Stem (Binyan)
  - t: Verb Tense / Conjugation
  - d: Gender m f c (common)
  - n: Number (sg,du,pl)
  - r: person (1,2,3)
  - a: state (absolute,construct,determined)
