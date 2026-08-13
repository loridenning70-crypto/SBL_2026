from tf.app import use

A = use('ETCBC/bhsa', hoist=globals())

def fetch_verse_node(book, chapter, verse):
	return T.nodeFromSection((book, chapter, verse))

# Create the passage retrieval
# Each passage much require Hebrew (Pointed MT), English Translation, gloss/morphology
def get_passage(book, chapter, start_verse, end_verse=None):
	if end_verse is None:
			end_verse = start_verse

	start_node = fetch_verse_node(book, chapter, start_verse)
	end_node = fetch_verse_node(book, chapter, end_verse)

	if start_node is None or end_node is None:
			return []

	verses = [start_node]
	current = start_node

	while current != end_node:
			next_verses = L.n(current, otype="verse")
			if not next_verses:
					break
			current = next_verses[0]
			verses.append(current)

	rows = []
	for verse_node in verses:
			words = L.d(verse_node, otype="word")
			book, chapter, verse = T.sectionFromNode(verse_node)
			rows.append(
					{
							"f": f"{book}:{chapter}:{verse}",
							"h": T.text(verse_node, fmt="text-orig-full"),
							"w": [
									{
											"s": T.text(word),
											"g": F.gloss.v(lex_node) if (lex_nodes := L.u(word, otype="lex")) and (lex_node := lex_nodes[0]) else None,
											"m": {
													key: value
													for key, value in {
															"p": F.sp.v(word),
															"o": F.pdp.v(word),
															"v": F.vs.v(word),
															"t": F.vt.v(word),
															"d": F.gn.v(word),
															"n": F.nu.v(word),
															"r": F.ps.v(word),
															"a": F.st.v(word),
													}.items()
													if value not in (None, "", "NA")
											},
											# "morphology": {
											# 	"sp": F.sp.v(word),
											# 	"pdp": F.pdp.v(word),
											# 	"vs": F.vs.v(word),
											# 	"vt": F.vt.v(word),
											# 	"gn": F.gn.v(word),
											# 	"nu": F.nu.v(word),
											# 	"ps": F.ps.v(word),
											# 	"st": F.st.v(word),
											# }
									}
									for word in words
							],
					}
			)

	return rows
