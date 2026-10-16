/**
 * The atlas is organised in two levels.
 *
 *  - `clusters` are the broad areas of the world. At a distance the globe
 *    shows one marker per cluster, so it never turns into confetti.
 *  - `regions` are the actual musical traditions. Zoom in and a cluster opens
 *    into the distinct traditions that live inside it — India alone carries
 *    Hindustani, Carnatic, Qawwali and Bhangra.
 *
 * Every tradition carries its own seal (`seal`), drawn from the instrument or
 * ornament that defines it, so no two markers say the same thing.
 */

export const clusters = [
  { id: 'south-asia', name: 'South Asia', lat: 22.0, lon: 79.0 },
  { id: 'west-africa', name: 'West Africa', lat: 10.5, lon: -6.0 },
  { id: 'latin-america', name: 'Latin America', lat: -14.0, lon: -60.0 },
  { id: 'east-asia', name: 'East Asia', lat: 34.0, lon: 118.0 },
  { id: 'middle-east', name: 'Middle East', lat: 32.0, lon: 40.0 },
  { id: 'europe', name: 'Europe', lat: 46.0, lon: 6.0 },
  { id: 'oceania', name: 'Oceania', lat: -28.0, lon: 141.0 },
  { id: 'east-africa', name: 'East Africa', lat: 3.0, lon: 38.5 },
  { id: 'central-asia', name: 'Central Asia', lat: 47.0, lon: 84.0 },
]

export const regions = [
  // ---------------------------------------------------------------- South Asia
  {
    id: 'hindustani',
    cluster: 'south-asia',
    seal: 'lotus',
    glyph: '♬',
    name: 'Hindustani',
    country: 'North India',
    genre: 'Raga',
    instruments: ['Sitar', 'Tabla', 'Bansuri'],
    lat: 25.3,
    lon: 83.0,
    audio: 'audio/hindustani.mp3',
    fact: "Indian classical music has no fixed tempo — the tabla player and soloist improvise together in real time, creating a conversation that's never played the same way twice.",
    heritage:
      'North Indian classical music descends from Vedic chant, refined over centuries of Mughal court patronage into gharanas — teaching lineages passed from master to student, ear to ear, for generations.',
    sound:
      'A raga is not a scale but a melodic personality: rules of ascent and descent, signature phrases, and a mood tied to a season or time of day, all unfolding over a rhythmic cycle called tala.',
    instrumentDetails: [
      { name: 'Sitar', type: 'string', desc: 'Long-necked lute with movable frets; sympathetic strings shimmer under every note.' },
      { name: 'Tabla', type: 'percussion', desc: 'A pair of tuned hand drums that speak a language of syllables called bols.' },
      { name: 'Bansuri', type: 'wind', desc: 'Side-blown bamboo flute, the instrument of Krishna in Indian art.' },
    ],
    listenFor: 'The drone beneath everything — and how the melody keeps returning home to it.',
  },
  {
    id: 'carnatic',
    cluster: 'south-asia',
    seal: 'veena',
    glyph: '♩',
    name: 'Carnatic',
    country: 'South India',
    genre: 'Kriti',
    instruments: ['Veena', 'Mridangam', 'Violin'],
    lat: 13.1,
    lon: 80.3,
    audio: 'audio/carnatic.mp3',
    fact: 'Carnatic musicians can improvise a whole concert from a single line of text — the same composition never comes out twice, though the words stay fixed.',
    heritage:
      'The southern classical tradition is built on devotional composition. The 18th-century trinity of Tyagaraja, Muthuswami Dikshitar and Syama Sastri wrote the songs that still anchor almost every concert.',
    sound:
      'Denser and more ornamented than the north: every note is bent and inflected through gamaka, and rhythmic cycles are counted openly on the hand by performers and audience alike.',
    instrumentDetails: [
      { name: 'Veena', type: 'string', desc: 'Carved from a single jackwood block, with a resonating gourd at the neck.' },
      { name: 'Mridangam', type: 'percussion', desc: 'Double-headed barrel drum, the rhythmic spine of every Carnatic concert.' },
      { name: 'Violin', type: 'string', desc: 'Adopted from Europe in the 1700s and re-tuned; played sitting, scroll on the ankle.' },
    ],
    listenFor: 'The audience keeping tala — quiet claps and finger counts marking the cycle.',
  },
  {
    id: 'qawwali',
    cluster: 'south-asia',
    seal: 'bellows',
    glyph: '♪',
    name: 'Qawwali',
    country: 'Pakistan / India',
    genre: 'Sufi devotional',
    instruments: ['Harmonium', 'Tabla', 'Handclaps'],
    lat: 26.45,
    lon: 74.64,
    audio: 'audio/qawwali.mp3',
    fact: 'A qawwali is designed to build for forty minutes or more — the repetition is the point, carrying singer and listener toward a state called haal.',
    heritage:
      'Sung at Sufi shrines for more than seven hundred years, qawwali was shaped by Amir Khusrau, who fused Persian, Arabic and Indian music into a devotional form for the Chishti order.',
    sound:
      'A lead voice throws a line, the party answers, and the handclaps drive underneath. Tempo and intensity climb together, phrases repeating and rising until the room lifts.',
    instrumentDetails: [
      { name: 'Harmonium', type: 'wind', desc: 'Hand-pumped reed organ; the right hand plays while the left works the bellows.' },
      { name: 'Tabla', type: 'percussion', desc: 'Drives the cycle, quickening as the song climbs.' },
      { name: 'Handclaps', type: 'percussion', desc: 'The whole party claps on the beat — the oldest instrument in the ensemble.' },
    ],
    listenFor: 'The moment the tempo lifts and the chorus takes over the line.',
  },
  {
    id: 'bhangra',
    cluster: 'south-asia',
    seal: 'dhol',
    glyph: '♫',
    name: 'Bhangra',
    country: 'Punjab',
    genre: 'Harvest folk',
    instruments: ['Dhol', 'Tumbi', 'Chimta'],
    lat: 31.1,
    lon: 75.3,
    audio: 'audio/bhangra.mp3',
    fact: 'Bhangra began as a harvest dance for the Punjabi spring festival of Baisakhi — it only became global pop music after Punjabi families carried it to Britain in the 1970s.',
    heritage:
      'Rooted in the wheat harvest of the Punjab, danced in the fields at Baisakhi. British-Punjabi producers later fused it with reggae and house, making it the first South Asian sound on Western dancefloors.',
    sound:
      'Everything serves the dance: a huge two-headed drum sets an unmissable pulse, a one-string tumbi darts above it, and voices call out in short, high, celebratory bursts.',
    instrumentDetails: [
      { name: 'Dhol', type: 'percussion', desc: 'Barrel drum slung at the waist, struck with two sticks — bass on one head, crack on the other.' },
      { name: 'Tumbi', type: 'string', desc: 'Single high-pitched string, plucked with one finger in a relentless bright loop.' },
      { name: 'Chimta', type: 'percussion', desc: 'Iron tongs hung with jingles, clashed on the beat.' },
    ],
    listenFor: 'The dhol pattern that makes standing still almost impossible.',
  },

  // --------------------------------------------------------------- West Africa
  {
    id: 'griot-kora',
    cluster: 'west-africa',
    seal: 'kora',
    glyph: '♩',
    name: 'Griot',
    country: 'Mali / Senegal',
    genre: 'Kora tradition',
    instruments: ['Kora', 'Balafon', 'Ngoni'],
    lat: 12.6,
    lon: -8.0,
    audio: 'audio/west-africa.mp3', // placeholder: no free griot-kora recording yet (see CREDITS.md)
    fact: 'Griots are hereditary musicians who serve as living libraries — oral historians who have memorised centuries of lineage, battles, and stories in song.',
    heritage:
      'Griots (jeli) are the hereditary musician-historians of the Mande empires. Since the 13th-century Mali Empire they have kept genealogies, epics and law alive in song — an archive older than most libraries.',
    sound:
      'The kora sounds like a harp and a guitar at once: rippling interlocking patterns under a spoken-sung narration that can praise, advise, or gently rebuke.',
    instrumentDetails: [
      { name: 'Kora', type: 'string', desc: '21 strings over a calabash gourd, played with thumbs and forefingers.' },
      { name: 'Balafon', type: 'percussion', desc: 'Wooden-keyed xylophone with gourd resonators that buzz.' },
      { name: 'Ngoni', type: 'string', desc: 'Ancestor of the banjo — a small plucked lute with a skin soundboard.' },
    ],
    listenFor: 'Two hands playing two different patterns that lock into one.',
  },
  {
    id: 'djembe',
    cluster: 'west-africa',
    seal: 'djembe',
    glyph: '♬',
    name: 'Djembe',
    country: 'Guinea / Mali',
    genre: 'Mande percussion',
    instruments: ['Djembe', 'Dunun', 'Kenkeni'],
    lat: 9.6,
    lon: -13.6,
    audio: 'audio/west-africa.mp3',
    fact: 'One djembe can produce three clearly different notes — bass, tone and slap — so a single drummer can carry melody and rhythm at once.',
    heritage:
      'Carved from a single log and traditionally played by Mande blacksmith castes, the djembe accompanies harvests, weddings and initiations. Its name is often traced to a phrase meaning "everyone gather in peace".',
    sound:
      'An ensemble, not a solo: bass dunun drums lay the frame while djembes answer each other, cutting across the pulse in interlocking cycles.',
    instrumentDetails: [
      { name: 'Djembe', type: 'percussion', desc: 'Goblet drum with a goatskin head, played bare-handed.' },
      { name: 'Dunun', type: 'percussion', desc: 'Large bass drum struck with a stick, often with a bell mounted on top.' },
      { name: 'Kenkeni', type: 'percussion', desc: 'The smallest bass drum, holding the steady heartbeat.' },
    ],
    listenFor: 'The call that signals the whole ensemble to change together.',
  },
  {
    id: 'afrobeat',
    cluster: 'west-africa',
    seal: 'horn',
    glyph: '♪',
    name: 'Afrobeat',
    country: 'Nigeria',
    genre: 'Afrobeat',
    instruments: ['Horns', 'Shekere', 'Electric guitar'],
    lat: 6.5,
    lon: 3.4,
    audio: 'audio/afrobeat.mp3',
    fact: 'Fela Kuti routinely wrote songs longer than twenty minutes — one groove, held and layered, because the point was the trance and the message, not the radio edit.',
    heritage:
      'Forged in 1970s Lagos by Fela Kuti and drummer Tony Allen, Afrobeat welded Yoruba rhythm and highlife to American funk and jazz, and used it to speak directly against military rule.',
    sound:
      'A deep, unhurried groove built from many small parts — guitar tick, shekere rattle, bass ostinato — with horn lines punching over the top and long call-and-response vocals.',
    instrumentDetails: [
      { name: 'Horn section', type: 'wind', desc: 'Trumpets and saxes in tight stabs, answering the singer.' },
      { name: 'Shekere', type: 'percussion', desc: 'Gourd wrapped in a net of beads, shaken and slapped.' },
      { name: 'Electric guitar', type: 'string', desc: 'Short repeating figures that interlock rather than solo.' },
    ],
    listenFor: 'How little changes — and how much that makes you move.',
  },

  // ------------------------------------------------------------- Latin America
  {
    id: 'andean',
    cluster: 'latin-america',
    seal: 'panpipes',
    glyph: '♫',
    name: 'Andean',
    country: 'Peru / Bolivia',
    genre: 'Andean folk',
    instruments: ['Siku', 'Charango', 'Quena'],
    lat: -16.5,
    lon: -68.1,
    audio: 'audio/latin-america.mp3',
    fact: 'The Charango was traditionally made from the shell of an armadillo, and its bright sound was designed to carry across mountain valleys at altitude.',
    heritage:
      "Andean music predates the Inca — panpipes more than 2,000 years old survive from Peru's coast. Indigenous wind traditions later absorbed Spanish strings, giving rise to the huayno sound heard today.",
    sound:
      'Pentatonic melodies built to travel — bright and breathy, made to carry across high mountain valleys.',
    instrumentDetails: [
      { name: 'Siku (zampoña)', type: 'wind', desc: 'Panpipes traditionally shared by two players who alternate notes of one melody.' },
      { name: 'Charango', type: 'string', desc: 'Tiny ten-string lute, once made from an armadillo shell.' },
      { name: 'Quena', type: 'wind', desc: 'Notched-end flute of the Andes, played since pre-Columbian times.' },
    ],
    listenFor: 'The breath inside every note — the pipes never hide that a person is blowing.',
  },
  {
    id: 'son-cubano',
    cluster: 'latin-america',
    seal: 'claves',
    glyph: '♩',
    name: 'Son Cubano',
    country: 'Cuba',
    genre: 'Son',
    instruments: ['Tres', 'Congas', 'Claves'],
    lat: 20.0,
    lon: -75.8,
    audio: 'audio/son-cubano.mp3',
    fact: 'Almost all Cuban dance music is organised around the clave — a five-stroke pattern that everyone in the band feels, even when nobody is playing it out loud.',
    heritage:
      'Son emerged in eastern Cuba around 1900, joining Spanish song forms and guitar to Afro-Cuban percussion. It became the root of salsa and much of what the world now calls Latin music.',
    sound:
      'A song half that opens gently, then a montuno half where a repeated vamp takes over and the singer trades lines with the chorus while percussion rises.',
    instrumentDetails: [
      { name: 'Tres', type: 'string', desc: 'Cuban guitar with three doubled courses, playing bright interlocking figures.' },
      { name: 'Congas', type: 'percussion', desc: 'Tall hand drums that answer the bass and drive the montuno.' },
      { name: 'Claves', type: 'percussion', desc: 'Two hardwood sticks carrying the pattern the whole band is built on.' },
    ],
    listenFor: 'The clave pattern — once you hear it, you hear it under everything.',
  },
  {
    id: 'tango',
    cluster: 'latin-america',
    seal: 'bandoneon',
    glyph: '♭',
    name: 'Tango',
    country: 'Argentina',
    genre: 'Tango',
    instruments: ['Bandoneón', 'Violin', 'Piano'],
    lat: -34.6,
    lon: -58.4,
    audio: 'audio/tango.mp3',
    fact: 'The bandoneón was invented in Germany for churches that could not afford an organ — it reached Buenos Aires by ship and became the defining voice of tango.',
    heritage:
      'Tango grew in the immigrant portside neighbourhoods of Buenos Aires and Montevideo in the 1880s, mixing European dance forms with African-rooted candombe rhythm before spreading to the salons of Paris.',
    sound:
      'Sharp, elastic phrasing: the band lunges forward and pulls back, sudden accents and long sighing lines, all shadowed by the bandoneón.',
    instrumentDetails: [
      { name: 'Bandoneón', type: 'wind', desc: 'Button concertina whose buttons give different notes pushing and pulling.' },
      { name: 'Violin', type: 'string', desc: 'Carries the singing line and the sharp, scraped accents.' },
      { name: 'Piano', type: 'percussion', desc: 'Anchors the harmony and drives the rhythmic push.' },
    ],
    listenFor: 'The deliberate hesitation before the beat lands.',
  },
  {
    id: 'samba',
    cluster: 'latin-america',
    seal: 'tambourine',
    glyph: '♬',
    name: 'Samba',
    country: 'Brazil',
    genre: 'Samba',
    instruments: ['Pandeiro', 'Cavaquinho', 'Surdo'],
    lat: -22.9,
    lon: -43.2,
    audio: 'audio/samba.mp3',
    fact: 'A carnival samba school can field three hundred drummers at once — the surdos alone are tuned in three pitches so the wall of sound still has a melody.',
    heritage:
      'Samba took shape in early 20th-century Rio among Afro-Brazilian communities from Bahia, carrying Angolan and Congolese rhythmic roots into the roda and then into carnival.',
    sound:
      'A rolling two-beat pulse with the accent leaning off the downbeat, huge low surdos beneath and a constant shimmer of hand percussion above.',
    instrumentDetails: [
      { name: 'Pandeiro', type: 'percussion', desc: 'Brazilian tambourine — one hand plays bass, tone, slap and jingle all at once.' },
      { name: 'Cavaquinho', type: 'string', desc: 'Small four-string guitar that chops the harmony.' },
      { name: 'Surdo', type: 'percussion', desc: 'Deep bass drum marking the heartbeat of the samba.' },
    ],
    listenFor: 'The surdo on the second beat — the push the whole dance hangs from.',
  },

  // ----------------------------------------------------------------- East Asia
  {
    id: 'chinese-classical',
    cluster: 'east-asia',
    seal: 'cloud',
    glyph: '♪',
    name: 'Chinese classical',
    country: 'China',
    genre: 'Guoyue',
    instruments: ['Guzheng', 'Erhu', 'Pipa'],
    lat: 34.3,
    lon: 108.9,
    audio: 'audio/east-asia.mp3',
    fact: 'The erhu has only two strings and no fingerboard — the player presses the strings in mid-air, which is why it can slide and cry like a human voice.',
    heritage:
      'Chinese instrumental music carries a scholar tradition thousands of years old, in which playing was one of the four arts a cultivated person was expected to master.',
    sound:
      'Melody above all, with space around it: bent notes, sudden ornaments, and long silences that are treated as part of the phrase.',
    instrumentDetails: [
      { name: 'Guzheng', type: 'string', desc: 'Long zither with movable bridges; the left hand bends notes behind them.' },
      { name: 'Erhu', type: 'string', desc: 'Two-stringed fiddle with the bow hair fixed between the strings.' },
      { name: 'Pipa', type: 'string', desc: 'Pear-shaped lute played with five taped fingerpicks; famous for battle scenes.' },
    ],
    listenFor: 'The silences — they are shaped as carefully as the notes.',
  },
  {
    id: 'japanese-koto',
    cluster: 'east-asia',
    seal: 'koto',
    glyph: '♩',
    name: 'Koto & Shakuhachi',
    country: 'Japan',
    genre: 'Sōkyoku',
    instruments: ['Koto', 'Shakuhachi', 'Shamisen'],
    lat: 35.0,
    lon: 135.8,
    audio: 'audio/japanese-koto.mp3',
    fact: 'Shakuhachi playing was once a form of Zen meditation rather than performance — wandering monks played it as suizen, "blowing meditation".',
    heritage:
      'Court gagaku arrived from the Asian mainland by the 8th century. Later the koto and shamisen moved music into merchant townhouses, while komusō monks carried the shakuhachi.',
    sound:
      'Deliberate and spacious: single notes given room to decay, breath left audible in the flute, and pitch bent gently at the end of phrases.',
    instrumentDetails: [
      { name: 'Koto', type: 'string', desc: 'Thirteen silk strings over movable bridges, plucked with ivory picks.' },
      { name: 'Shakuhachi', type: 'wind', desc: 'End-blown bamboo flute; tone is shaped by tilting the head.' },
      { name: 'Shamisen', type: 'string', desc: 'Three-stringed lute struck with a large plectrum for a percussive snap.' },
    ],
    listenFor: 'The breath and the buzz — imperfection is kept on purpose.',
  },
  {
    id: 'korean-gugak',
    cluster: 'east-asia',
    seal: 'gayageum',
    glyph: '♮',
    name: 'Pansori & Gugak',
    country: 'Korea',
    genre: 'Gugak',
    instruments: ['Gayageum', 'Janggu', 'Voice'],
    lat: 37.5,
    lon: 127.0,
    audio: 'audio/korean-gugak.mp3',
    fact: 'A full pansori epic can run more than five hours, performed by a single singer and one drummer — the singer plays every character in the story.',
    heritage:
      'Pansori grew from 17th-century village storytelling into a high art. Singers train for years to acquire a deliberately husky voice, sometimes practising beside waterfalls to sing over them.',
    sound:
      'Rough, powerful voice against a single drum, swinging between spoken narration and full song, with the drummer shouting encouragement throughout.',
    instrumentDetails: [
      { name: 'Gayageum', type: 'string', desc: 'Twelve-string zither; the left hand presses behind the bridges to bend pitch.' },
      { name: 'Janggu', type: 'percussion', desc: 'Hourglass drum with two differently tuned heads — one struck by hand, one by stick.' },
      { name: 'Voice', type: 'voice', desc: 'Trained toward a deliberately raw, cracked timbre called sugseong.' },
    ],
    listenFor: "The drummer's shouts of chuimsae — encouragement woven into the music.",
  },

  // --------------------------------------------------------------- Middle East
  {
    id: 'maqam-oud',
    cluster: 'middle-east',
    seal: 'islamic-star',
    glyph: '♭',
    name: 'Maqam',
    country: 'Egypt / Turkey',
    genre: 'Maqam tradition',
    instruments: ['Oud', 'Qanun', 'Darbuka'],
    lat: 30.0,
    lon: 31.2,
    audio: 'audio/middle-east.mp3',
    fact: 'Arabic music uses microtones — pitches between the notes of a Western piano. The Maqam system has over 70 named scales, many impossible to play on standard keyboards.',
    heritage:
      'The maqam system was theorized by scholars such as al-Farabi more than a thousand years ago, and refined in the courts and coffeehouses of Cairo, Aleppo and Istanbul.',
    sound:
      'Dozens of modes using microtones — intervals finer than a piano can play — explored through taqsim, a free, unmetered improvisation.',
    instrumentDetails: [
      { name: 'Oud', type: 'string', desc: "Fretless short-necked lute; its name (al-ʿūd) became the European word 'lute'." },
      { name: 'Qanun', type: 'string', desc: 'Plucked zither of about 78 strings, with tiny levers for tuning microtones.' },
      { name: 'Darbuka', type: 'percussion', desc: 'Goblet drum played with crisp fingertip and palm strokes.' },
    ],
    listenFor: "Notes 'between the keys' — pitches a piano cannot reach.",
  },
  {
    id: 'persian-classical',
    cluster: 'middle-east',
    seal: 'persian-medallion',
    glyph: '♫',
    name: 'Persian classical',
    country: 'Iran',
    genre: 'Radif',
    instruments: ['Tar', 'Santur', 'Ney'],
    lat: 35.7,
    lon: 51.4,
    audio: 'audio/persian-classical.mp3',
    fact: 'The entire Persian classical repertoire — the radif — is memorised, not read. A student may spend a decade absorbing several hundred short pieces before improvising freely.',
    heritage:
      'Persian art music is bound to Persian poetry: Hafez and Rumi are sung as often as they are read, and a performance is judged partly on how the music serves the verse.',
    sound:
      'Intimate and inward, built from modal systems called dastgah. Phrases circle a central note, ornamented with rapid tremolo and sudden drops into silence.',
    instrumentDetails: [
      { name: 'Tar', type: 'string', desc: 'Waisted lute with a skin soundboard and a bright, biting attack.' },
      { name: 'Santur', type: 'string', desc: 'Hammered dulcimer struck with two delicate wooden mallets.' },
      { name: 'Ney', type: 'wind', desc: 'End-blown reed flute, played against the teeth for a breathy, vocal tone.' },
    ],
    listenFor: 'How the singer and instrument imitate each other, phrase for phrase.',
  },
  {
    id: 'sufi-ney',
    cluster: 'middle-east',
    seal: 'whirl',
    glyph: '♩',
    name: 'Mevlevi Sufi',
    country: 'Turkey',
    genre: 'Sema ceremony',
    instruments: ['Ney', 'Kudüm', 'Voice'],
    lat: 37.9,
    lon: 32.5,
    audio: 'audio/sufi-ney.mp3',
    fact: 'The whirling of the Mevlevi dervishes is a prayer, not a performance — the right palm turns up to receive from heaven, the left turns down to give to the earth.',
    heritage:
      "Founded in 13th-century Konya by the followers of Rumi, the Mevlevi order made music central to worship. The ney's opening lament echoes the first lines of Rumi's Masnavi.",
    sound:
      'Begins with a solo reed flute, unaccompanied and mournful, then gathers voices and frame drums into a slow, circling pulse that never hurries.',
    instrumentDetails: [
      { name: 'Ney', type: 'wind', desc: 'Reed flute whose breathy cry opens the ceremony as a symbol of longing.' },
      { name: 'Kudüm', type: 'percussion', desc: 'Small paired kettledrums keeping the ceremonial cycle.' },
      { name: 'Voice', type: 'voice', desc: 'Hymns to the Prophet, sung in unison by the chorus.' },
    ],
    listenFor: 'The unaccompanied opening breath — the reed cut from the reed bed.',
  },

  // -------------------------------------------------------------------- Europe
  {
    id: 'celtic',
    cluster: 'europe',
    seal: 'triquetra',
    glyph: '𝄞',
    name: 'Celtic folk',
    country: 'Ireland',
    genre: 'Celtic folk',
    instruments: ['Uilleann pipes', 'Fiddle', 'Bodhrán'],
    lat: 53.3,
    lon: -6.3,
    audio: 'audio/europe.mp3',
    fact: 'Irish tunes are traded by ear in pub sessions — no sheet music, no leader. A player learns hundreds of melodies simply by sitting in and joining when they can.',
    heritage:
      'Irish dance music survived centuries of upheaval in kitchens and pubs rather than concert halls, carried by emigration to America where it fed bluegrass and country.',
    sound:
      'Fast, driving tunes in jigs and reels, ornamented with rolls and cuts, played in unison by whoever is at the table.',
    instrumentDetails: [
      { name: 'Uilleann pipes', type: 'wind', desc: 'Bellows-blown Irish pipes, quieter and sweeter than the Highland bagpipe.' },
      { name: 'Fiddle', type: 'string', desc: 'A violin played with regional bowing styles and heavy ornament.' },
      { name: 'Bodhrán', type: 'percussion', desc: 'Frame drum played with a double-headed beater called a tipper.' },
    ],
    listenFor: 'The lift — the swing that makes a reel feel like it is running downhill.',
  },
  {
    id: 'flamenco',
    cluster: 'europe',
    seal: 'guitar-rosette',
    glyph: '♬',
    name: 'Flamenco',
    country: 'Spain',
    genre: 'Flamenco',
    instruments: ['Guitar', 'Cajón', 'Palmas'],
    lat: 37.4,
    lon: -6.0,
    audio: 'audio/flamenco.mp3',
    fact: 'Flamenco rhythms are counted in twelve, but the accents fall in uneven places — which is why the handclaps sound like they are fighting the beat until suddenly they are not.',
    heritage:
      'Flamenco formed in Andalusia among Roma, Moorish, Jewish and Andalusian communities. It moved from private gatherings to the café cantante stages of the 19th century.',
    sound:
      'Voice, guitar and clapping in tense conversation. Cante can be raw and cracked; the guitar answers with rapid rasgueado strums and sudden silences.',
    instrumentDetails: [
      { name: 'Guitar', type: 'string', desc: 'Lighter and brighter than a classical guitar, built to cut through clapping.' },
      { name: 'Cajón', type: 'percussion', desc: 'Wooden box drum brought from Peru in the 1970s and instantly adopted.' },
      { name: 'Palmas', type: 'percussion', desc: 'Handclaps — sharp or muffled — marking the twelve-count cycle.' },
    ],
    listenFor: 'The accents landing on 12, 3, 6, 8 and 10 rather than evenly.',
  },
  {
    id: 'fado',
    cluster: 'europe',
    seal: 'teardrop',
    glyph: '♪',
    name: 'Fado',
    country: 'Portugal',
    genre: 'Fado',
    instruments: ['Portuguese guitar', 'Viola', 'Voice'],
    lat: 38.7,
    lon: -9.1,
    audio: 'audio/fado.mp3',
    fact: 'Fado is built around saudade — a Portuguese word with no English equivalent, meaning longing for something loved and gone that may never return.',
    heritage:
      'Born in the port districts of Lisbon in the early 1800s among sailors and the poor, fado was later carried to the world by Amália Rodrigues.',
    sound:
      'A single voice carrying the whole weight, shadowed by the bright metallic ripple of the Portuguese guitar. Slow, plain, and deliberately unadorned.',
    instrumentDetails: [
      { name: 'Portuguese guitar', type: 'string', desc: 'Pear-shaped, twelve steel strings in six courses, with a teardrop soundhole.' },
      { name: 'Viola', type: 'string', desc: 'The classical guitar, holding the harmony beneath.' },
      { name: 'Voice', type: 'voice', desc: 'Front and centre — fado lives or dies on the singer.' },
    ],
    listenFor: 'The guitar answering the singer in the gaps between lines.',
  },
  {
    id: 'balkan-brass',
    cluster: 'europe',
    seal: 'horn',
    glyph: '♯',
    name: 'Balkan brass',
    country: 'Serbia / Romania',
    genre: 'Brass band',
    instruments: ['Trumpet', 'Tuba', 'Goč drum'],
    lat: 43.9,
    lon: 20.4,
    audio: 'audio/balkan-brass.mp3',
    fact: 'The Guča trumpet festival in Serbia draws hundreds of thousands of people, and bands compete by playing directly at each other until one crowd cheers louder.',
    heritage:
      'Ottoman and Habsburg military bands left brass instruments across the Balkans; Roma musicians took them into weddings and funerals and made the style their own.',
    sound:
      'Fast, loud and lurching, in odd metres that trip and recover, with trumpets screaming above a tuba pumping the offbeat.',
    instrumentDetails: [
      { name: 'Trumpet', type: 'wind', desc: 'Carries the melody, ornamented and pushed to the edge of the horn.' },
      { name: 'Tuba', type: 'wind', desc: 'Plays the bass and the offbeat at once — the engine of the band.' },
      { name: 'Goč', type: 'percussion', desc: 'Double-headed drum played with a beater and a switch.' },
    ],
    listenFor: 'Metres in 7 or 11 that never quite settle where you expect.',
  },

  // ------------------------------------------------------------------- Oceania
  {
    id: 'songlines',
    cluster: 'oceania',
    seal: 'dot-painting',
    glyph: '♩',
    name: 'Songlines',
    country: 'Australia',
    genre: 'Aboriginal songlines',
    instruments: ['Didgeridoo', 'Clapsticks', 'Voice'],
    lat: -23.7,
    lon: 133.9,
    audio: 'audio/oceania.mp3',
    fact: 'Songlines are sung maps — the melody and words describe landmarks in order, so a song can navigate a traveller across hundreds of kilometres of country.',
    heritage:
      'The oldest continuous musical culture on Earth, stretching back tens of thousands of years. Songs are owned by particular groups and carry law, geography and ancestry together.',
    sound:
      'A continuous drone shaped into rhythm by the mouth and throat, punctuated by clapsticks and voice — the breath never seems to stop.',
    instrumentDetails: [
      { name: 'Didgeridoo', type: 'wind', desc: 'A eucalyptus trunk hollowed by termites; played with circular breathing.' },
      { name: 'Clapsticks', type: 'percussion', desc: 'Paired hardwood sticks marking the song rhythm.' },
      { name: 'Voice', type: 'voice', desc: 'Carries the words that map the country being sung.' },
    ],
    listenFor: 'Circular breathing — the drone that never pauses for air.',
  },
  {
    id: 'taonga-puoro',
    cluster: 'oceania',
    seal: 'koru',
    glyph: '♫',
    name: 'Taonga pūoro',
    country: 'Aotearoa New Zealand',
    genre: 'Māori waiata',
    instruments: ['Pūtōrino', 'Kōauau', 'Poi'],
    lat: -38.7,
    lon: 176.1,
    audio: 'audio/taonga-puoro.mp3',
    fact: 'Māori instruments nearly fell silent in the 20th century; from the 1980s a small group of practitioners rebuilt the tradition from museum pieces and oral memory.',
    heritage:
      'Taonga pūoro are treasured instruments tied to the natural world — each associated with an atua (deity) and used for healing, birth, mourning and storytelling as much as performance.',
    sound:
      'Voices of birds, wind and water: breathy flutes, spun cords that whirr, and waiata sung in close unison.',
    instrumentDetails: [
      { name: 'Pūtōrino', type: 'wind', desc: 'Bugle-flute with two voices — a male trumpet tone and a female flute tone.' },
      { name: 'Kōauau', type: 'wind', desc: 'Small cross-blown flute of wood or bone.' },
      { name: 'Poi', type: 'percussion', desc: 'Weighted cords swung to strike the body in rhythm with the song.' },
    ],
    listenFor: 'Instruments imitating birdsong — the forest quoted directly.',
  },

  // --------------------------------------------------------------- East Africa
  {
    id: 'ethiopian',
    cluster: 'east-africa',
    seal: 'lyre',
    glyph: '♮',
    name: 'Ethiopian',
    country: 'Ethiopia',
    genre: 'Ethiopian modal',
    instruments: ['Begena', 'Krar', 'Masenqo'],
    lat: 9.0,
    lon: 38.7,
    audio: 'audio/east-africa.mp3',
    fact: 'Ethiopian music uses four main pentatonic modes called qignit — which is why even a modern Ethio-jazz record sounds instantly, unmistakably Ethiopian.',
    heritage:
      'Ethiopia kept its own notation and church music for over 1,500 years, developed in the Orthodox tradition and never colonised out of existence.',
    sound:
      'Wide-spaced pentatonic modes over a hypnotic repeating figure, with a buzzing lyre and a one-string fiddle answering the voice.',
    instrumentDetails: [
      { name: 'Begena', type: 'string', desc: 'Large ten-string lyre with a deep buzzing tone, used for meditation and prayer.' },
      { name: 'Krar', type: 'string', desc: 'Smaller five- or six-string lyre for secular songs and dance.' },
      { name: 'Masenqo', type: 'string', desc: 'Single-string spike fiddle, bowed, used to accompany sung poetry.' },
    ],
    listenFor: 'The buzz — leather or wire deliberately left to rattle against the strings.',
  },
  {
    id: 'taarab',
    cluster: 'east-africa',
    seal: 'wave-oud',
    glyph: '♪',
    name: 'Taarab',
    country: 'Zanzibar / Tanzania',
    genre: 'Taarab',
    instruments: ['Oud', 'Qanun', 'Violin'],
    lat: -6.16,
    lon: 39.2,
    audio: 'audio/taarab.mp3',
    fact: 'Taarab lyrics are famous for double meanings — a song of apparent praise can carry a sharp insult aimed at someone specific in the room.',
    heritage:
      'Taarab grew in 19th-century Zanzibar where Swahili, Arab, Indian and African worlds met in the monsoon trade, patronised by the Omani sultans and later carried by women’s clubs.',
    sound:
      'A large orchestra of Arab and Indian instruments playing lush unison lines behind a Swahili singer, in a slow, swaying coastal groove.',
    instrumentDetails: [
      { name: 'Oud', type: 'string', desc: 'The Arab lute, carried down the coast by monsoon trade.' },
      { name: 'Qanun', type: 'string', desc: 'Plucked zither adding shimmering runs between vocal lines.' },
      { name: 'Violin', type: 'string', desc: 'Played in a whole section, doubling the melody in unison.' },
    ],
    listenFor: 'Swahili poetry — the words matter as much as the tune.',
  },

  // -------------------------------------------------------------- Central Asia
  {
    id: 'khoomei',
    cluster: 'central-asia',
    seal: 'overtone',
    glyph: '♯',
    name: 'Khoomei',
    country: 'Tuva / Mongolia',
    genre: 'Throat singing',
    instruments: ['Throat singing', 'Igil', 'Doshpuluur'],
    lat: 51.7,
    lon: 94.4,
    audio: 'audio/central-asia.mp3',
    fact: 'Throat singing (Tuvan khoomei) lets a single vocalist produce two notes simultaneously — a drone and a melody — by shaping resonant chambers inside the body.',
    heritage:
      'This is the music of horseback nomads. Tuvan and Mongolian herders learned to sing with the landscape — imitating wind, water and birdsong across open steppe.',
    sound:
      'Khoomei splits one voice in two: a low growling drone with a whistling overtone melody riding above it.',
    instrumentDetails: [
      { name: 'Throat singing', type: 'voice', desc: 'One singer sounds a drone and an overtone melody at the same time.' },
      { name: 'Igil', type: 'string', desc: 'Two-string horsehair fiddle, often carved with a horse’s head.' },
      { name: 'Doshpuluur', type: 'string', desc: 'Long-necked plucked lute with a skin or wooden face.' },
    ],
    listenFor: 'The whistling overtone floating above the growl — one person, two notes.',
  },
  {
    id: 'dombyra',
    cluster: 'central-asia',
    seal: 'steppe-diamond',
    glyph: '♬',
    name: 'Küy',
    country: 'Kazakhstan',
    genre: 'Steppe folk',
    instruments: ['Dombyra', 'Kobyz', 'Sybyzgy'],
    lat: 43.2,
    lon: 76.9,
    audio: 'audio/central-asia.mp3', // placeholder: no free dombyra recording yet (see CREDITS.md)
    fact: 'A küy is an instrumental story — each traditional piece has a narrative attached, and audiences are expected to know which tale the notes are telling.',
    heritage:
      'Kazakh bards travelled the steppe as reciters and news-carriers. Their küy repertoire preserved history and legend in purely instrumental form.',
    sound:
      'Two strings doing the work of many: rapid strummed figures with a rolling drone underneath, imitating hoofbeats and open wind.',
    instrumentDetails: [
      { name: 'Dombyra', type: 'string', desc: 'Two-string long-necked lute, strummed fast with the whole hand.' },
      { name: 'Kobyz', type: 'string', desc: 'Bowed horsehair fiddle once used by shamans; an eerie, breathy tone.' },
      { name: 'Sybyzgy', type: 'wind', desc: 'Open reed flute played with a sung drone in the throat.' },
    ],
    listenFor: 'The gallop — rhythms built to sound like horses on open ground.',
  },
]

/** Traditions belonging to a cluster. */
export function traditionsIn(clusterId) {
  return regions.filter((r) => r.cluster === clusterId)
}
