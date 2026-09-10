/**
 * Renders the GENZ translation from its source text.
 *
 *     npm run refresh:genz
 *
 * Input   data/bibles/GENZ/base.json   the source text (never written to)
 * Output  data/bibles/GENZ/full.json   the GENZ voice, regenerated from scratch
 *
 * Keeping the two files apart is what makes this rerunnable: every run starts
 * from the same source, so editing a rule below changes the output instead of
 * compounding on top of the previous run. `base.json` is the translation as of
 * commit e4df705 and is a snapshot, not an edit surface -- it already carries a
 * few blanket substitutions of its own, which `repairSource` undoes here rather
 * than by rewriting the file, so the snapshot stays reproducible from git.
 *
 * Four layers, in order of authority:
 *
 *   referenceRewrites  hand-written chapters that define the voice
 *   exactRewrites      hand-written single verses
 *   repairSource()     undoes substitutions the source arrived with
 *   modernize()        rules that carry that voice across the rest of the canon
 *
 * The rules lean on a property of the source: it capitalizes a connective only
 * when it opens a sentence, so `Therefore` and `therefore` can be rewritten
 * differently without parsing anything. Single-word swaps go through `word()`,
 * which restores the capital the source had, so a replacement never leaves a
 * lowercase letter mid-passage.
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

type Verse = { book: number; chapter: number; verse: number; text: string };
const dataDir = path.join(process.cwd(), "data", "bibles", "GENZ");
const basePath = path.join(dataDir, "base.json");
const outputPath = path.join(dataDir, "full.json");

const exactRewrites = new Map<string, string>([
    ["God saw everything that he had made, and, look, it was very good. There was evening and there was morning, a sixth day.", "God checked out everything he made, and honestly, it was all pretty awesome. Then evening came, morning followed, and just like that, day six wrapped up."],
    ["In the beginning, God created the heavens and the earth.", "At the very start, God created the heavens and the earth."],
    ["God said, “Let there be light,” and there was light.", "Then God said, “Let there be light,” and just like that, light showed up."],
]);

const referenceRewrites = new Map<string, string>([
    ["6:1:1", "So after Moses passed away, the Lord hit up Joshua, Moses’ right-hand guy, and said,"],
    ["6:1:2", "“Moses is gone; it’s time for you to step up, cross this Jordan with all your crew, and claim the land I’m giving to the Israelites.”"],
    ["6:1:3", "“Every spot your feet touch is yours, just like I promised Moses.”"],
    ["6:1:4", "“From the wilds and Lebanon all the way to the Euphrates River, and all the Hittite territory to the big sea at sunset, that’s your turf.”"],
    ["6:1:5", "“No one will be able to take you down for as long as you live. I was with Moses, and I’ll be with you too. I’ve got your back, no matter what.”"],
    ["6:1:6", "“So be strong and brave; you’re gonna share this land as an inheritance with the people, just like I promised their ancestors.”"],
    ["6:1:7", "“Just stay strong and super courageous. Follow all the laws Moses gave you. Don’t stray from them—keep focused so you can thrive wherever you go.”"],
    ["6:1:8", "“Keep this Book of the Law close; think about it day and night so you can live by everything in it. Then you’ll succeed, and things will go well for you.”"],
    ["6:1:9", "“Didn’t I tell you? Be strong and brave. Don’t be scared or discouraged, because the Lord your God is with you wherever you go.”"],
    ["6:1:10", "Then Joshua rallied the leaders of the people, saying,"],
    ["6:1:11", "“Go through the camp and tell everyone to get ready. In three days, we’re crossing this Jordan to take over the land the Lord your God is giving us.”"],
    ["6:1:12", "Joshua also spoke to the Reubenites, Gadites, and half the tribe of Manasseh, saying,"],
    ["6:1:13", "“Remember what Moses told you? The Lord your God has given you rest and this land.”"],
    ["6:1:14", "“Your families and livestock can chill in the land Moses gave you on this side of the Jordan, but you guys need to step up for your brothers—be ready to fight alongside them.”"],
    ["6:1:15", "“Once your brothers find rest like you have and claim the land the Lord your God is giving them, you can head back to your own territory and enjoy what Moses gave you on this side toward the sunrise.”"],
    ["6:1:16", "They replied to Joshua, “Whatever you say, we’re in. Wherever you send us, we’ll go.”"],
    ["6:1:17", "“Just like we listened to Moses in everything, we’ll listen to you too. Just make sure the Lord your God is with you like he was with Moses.”"],
    ["6:1:18", "“Anyone who rebels against what you say or ignores your commands will be dealt with seriously. Just stay strong and brave.”"],
    ["40:17:1", "After six days, Jesus grabbed Peter, James, and his brother John and took them up a chill mountain, just the four of them."],
    ["40:17:2", "Then, out of nowhere, he totally transformed; his face was shining like the sun, and his clothes were super bright, like light."],
    ["40:17:3", "And suddenly, Moses and Elijah showed up, just vibing and chatting with him."],
    ["40:17:4", "Peter was like, “Yo, Jesus, this is awesome! Let’s set up three tents here—one for you, one for Moses, and one for Elijah.”"],
    ["40:17:5", "While he was still talking, a bright cloud rolled in and covered them. Then a voice from the cloud said, “This is my beloved Son; I’m stoked about him—listen to what he says.”"],
    ["40:17:6", "The disciples heard this and hit the ground in fear."],
    ["40:17:7", "Jesus came over, touched them, and said, “Get up; don’t be scared.”"],
    ["40:17:8", "When they looked up, they only saw Jesus—no one else around."],
    ["40:17:9", "As they were coming down the mountain, Jesus told them not to spill the tea about what they saw until he rises from the dead."],
    ["40:17:10", "The disciples were curious and asked him, “Why do the scribes say Elijah has to come first?”"],
    ["40:17:11", "Jesus was like, “For real, Elijah’s gotta come first and fix everything up.”"],
    ["40:17:12", "“But here’s the tea: Elijah’s already been here, and they totally missed him. They did whatever they wanted to him. Same vibes for the Son of Man; he’s gonna go through it too.”"],
    ["40:17:13", "Then the disciples finally got it; he was talking about John the Baptist."],
    ["40:17:14", "When they got back to the crowd, a dude came up, kneeling and saying,"],
    ["40:17:15", "“Lord, please help my son! He’s really struggling; he has these crazy fits where he falls into fire and water."],
    ["40:17:16", "“I brought him to your disciples, but they couldn’t help him.”"],
    ["40:17:17", "Jesus replied, “Wow, you guys are lacking faith. How long do I have to deal with this? Bring him over here.”"],
    ["40:17:18", "Jesus told the evil spirit to bounce, and it left him. The kid was healed right then and there."],
    ["40:17:19", "Later, the disciples pulled Jesus aside and asked, “Why couldn’t we kick it out?”"],
    ["40:17:20", "Jesus said, “It’s because you didn’t believe. For real, if you have faith even just a little bit, like a mustard seed, you could tell this mountain to move, and it would. Nothing would be impossible for you.”"],
    ["40:17:21", "“But honestly, some things only change with prayer and fasting.”"],
    ["40:17:22", "While they were chilling in Galilee, Jesus told them, “The Son of Man is gonna get betrayed by people."],
    ["40:17:23", "“They’ll kill him, but on the third day, he’ll be back.” They were really feeling down about it."],
    ["40:17:24", "When they got to Capernaum, some folks collecting taxes asked Peter, “Doesn’t your guy pay taxes?”"],
    ["40:17:25", "Peter was like, “Yeah.” But when he got home, Jesus was already on it, asking, “So, Simon, who do the kings of the earth collect taxes from—their kids or outsiders?”"],
    ["40:17:26", "Peter replied, “Outsiders.” Jesus said, “Exactly. So the kids are good."],
    ["40:17:27", "“But just to keep the peace, go to the sea, throw in a hook, and catch the first fish you pull up. Open its mouth, and you’ll find a coin. Use that to pay for both of us.”"],
    ["40:18:1", "So the disciples rolled up to Jesus and were like, “Who’s the GOAT in the kingdom of heaven?”"],
    ["40:18:2", "Jesus called over a little kid and had him stand right there with them,"],
    ["40:18:3", "and said, “For real, unless you switch it up and become like these kids, you can’t even vibe in the kingdom of heaven.”"],
    ["40:18:4", "Whoever humbles themselves like this little one is actually the greatest in the kingdom of heaven."],
    ["40:18:5", "And anyone who welcomes a kid like this in my name is welcoming me."],
    ["40:18:6", "But if you mess with one of these little believers, it’d be better for you to have a huge stone tied around your neck and be tossed into the ocean."],
    ["40:18:7", "Like, woe to the world for all the mess-ups! Offenses are gonna happen, but woe to the person causing them!"],
    ["40:18:8", "So if your hand or foot is tripping you up, just cut it off and toss it away. It’s better to enter life kinda broken than to have two hands or feet and end up in eternal fire."],
    ["40:18:9", "And if your eye is causing issues, pluck it out and throw it away. Better to enter life with one eye than to have two eyes and get tossed into hellfire."],
    ["40:18:10", "Just know, don’t look down on any of these little ones; I’m telling you, their angels are always seeing my Father’s face in heaven."],
    ["40:18:11", "The Son of Man came to save what was lost, you know?"],
    ["40:18:12", "So, like, what do you think? If a dude has a hundred sheep and one goes missing, wouldn’t he leave the ninety-nine to find the one that strayed?"],
    ["40:18:13", "And if he finds it, I’m telling you, he’s way happier about that one sheep than the ninety-nine that didn’t wander off."],
    ["40:18:14", "For real though, it’s not the vibe for your Father in heaven to lose even one of these little ones."],
    ["40:18:15", "And if your bro messes up with you, just go talk to him about it, just the two of you. If he listens, you’ve totally won him back."],
    ["40:18:16", "But if he doesn’t listen, grab one or two friends with you so that everything’s legit with some witnesses."],
    ["40:18:17", "If he still won’t hear them, then let the church know; but if he ignores the church too, treat him like someone who’s out of the crew."],
    ["40:18:18", "For real, whatever you bind on earth will be bound in heaven, and whatever you loose on earth will be loosed up there too."],
    ["40:18:19", "Again, I’m saying to you, if two of you agree on anything down here and ask for it, my Father in heaven will make it happen."],
    ["40:18:20", "Because where two or three are gathered in my name, I’m right there with them."],
    ["40:18:21", "So Peter rolls up to Jesus and asks, “Yo, how many times should I forgive my bro when he messes up? Like, seven times?”"],
    ["40:18:22", "Jesus replies, “Nah, not just seven times. I’m talking seventy times seven. Keep it going.”"],
    ["40:18:23", "The kingdom of heaven is kinda like a king who decided to check in on his servants."],
    ["40:18:24", "When he started counting, one servant was brought to him who owed a crazy amount—ten thousand talents."],
    ["40:18:25", "But since the dude couldn’t pay up, the king ordered that he, his wife, and kids be sold off to settle the debt."],
    ["40:18:26", "The servant fell down and begged, “Please, just give me some time and I’ll pay you back everything!”"],
    ["40:18:27", "The king felt for him, let him go, and wiped his debt clean."],
    ["40:18:31", "When his coworkers saw what went down, they were super bummed and went to tell their boss everything that happened."],
    ["40:19:1", "So, after Jesus wrapped up his chat, he left Galilee and headed over to Judea, crossing the Jordan."],
    ["40:20:1", "The kingdom of heaven is kinda like a dude who owns a vineyard and goes out early to hire some workers."],
    ["40:20:2", "He made a deal with them for a penny a day and sent them to work in his vineyard."],
    ["40:20:3", "Then, around mid-morning, he saw some folks just chilling in the marketplace, doing nothing."],
    ["40:20:4", "He told them, “Hey, go work in my vineyard, and I’ll pay you what’s fair.” So they bounced."],
    ["40:20:5", "He did the same thing around noon and again at three in the afternoon."],
    ["40:20:6", "Then, right before closing time, he found more people standing around and asked, “Why are you guys just hanging out all day?”"],
    ["40:20:7", "They replied, “No one’s hired us.” He said, “Go work in the vineyard; I’ll pay you what’s right.”"],
    ["40:20:8", "When evening came, the vineyard owner told his manager, “Call the workers and pay them, starting with the last ones first.”"],
    ["40:20:9", "So those who were hired at the last hour got paid a penny each."],
    ["40:20:10", "But when the first ones showed up, they thought they’d get more but ended up getting just a penny too."],
    ["40:20:11", "When they got their pay, they started complaining to the boss of the house,"],
    ["40:20:12", "saying, “These last guys only worked one hour, and you made them equal to us who worked all day in the heat.”"],
    ["40:20:13", "But he replied to one of them, “Chill, friend, I didn’t do you wrong. Didn’t we agree on a penny?”"],
    ["40:20:14", "“Take what’s yours and bounce. I’m giving this last guy the same as you.”"],
    ["40:20:15", "“Is it not my call to do what I want with my own stuff? Is your vibe off just because I’m being good?”"],
    ["40:20:16", "“So the last will be first, and the first will be last; many are called, but few are chosen.”"],
    ["40:20:17", "As Jesus was heading to Jerusalem, he took the twelve disciples aside and said to them,"],
    ["40:20:18", "“Yo, we’re going up to Jerusalem; the Son of Man is gonna be betrayed to the chief priests and scribes, and they’re gonna condemn him to death,"],
    ["40:20:19", "“and hand him over to the Gentiles to mock, beat up, and crucify him. But on the third day, he’s rising again.”"],
    ["40:20:20", "Then the mom of Zebedee’s kids came to him with her sons, worshipping him and asking for something."],
    ["40:20:21", "He asked her, “What do you want?” She replied, “Can my two sons sit next to you, one on your right and the other on your left in your kingdom?”"],
    ["40:20:22", "Jesus said, “You guys have no idea what you’re asking. Can you handle the cup I’m about to drink and the baptism I’m getting?” They said, “For sure, we can.”"],
    ["40:20:23", "Jesus told them, “You will drink from my cup and be baptized like I will be, but sitting on my right or left? That’s not mine to give. It’s for those my Father has prepared it for.”"],
    ["40:20:24", "When the other ten heard this, they were lowkey annoyed with the two brothers."],
    ["40:20:25", "Jesus called everyone over and said, “You know that the rulers of the Gentiles boss everyone around, and those who are great flex their authority."],
    ["40:20:26", "“But it shouldn’t be like that with you. If you want to be great, be a servant instead;"],
    ["40:20:27", "“and if you want to be the top dog, be a servant too."],
    ["40:20:28", "“Just like how the Son of Man didn’t come to be served but to serve and give his life as a ransom for many.”"],
    ["40:20:29", "As they were leaving Jericho, a huge crowd was following him."],
    ["40:20:30", "And then there were two blind guys sitting by the road. When they heard Jesus was passing by, they shouted, “Have mercy on us, Lord, Son of David!”"],
    ["40:20:31", "The crowd was like, “Chill out, you guys,” but they just shouted louder, “Please have mercy on us, Lord, Son of David!”"],
    ["40:20:32", "Jesus stopped and called them over, asking, “What do you want me to do for you?”"],
    ["40:20:33", "They replied, “Lord, we just want our eyes to be opened.”"],
    ["40:20:34", "Jesus felt for them and touched their eyes; instantly, they could see and started following him."],
]);

type Rule = { pattern: RegExp; replacement: string; followCase: boolean };

/**
 * Builds a rule whose replacement inherits the capital of whatever it replaced.
 *
 * Without this a swap like `Do not be afraid` -> `don’t panic` silently drops a
 * sentence into lowercase, which is how `? don’t panic.` used to reach readers.
 *
 * The pattern is anchored on both sides, because an unanchored `dwell` also
 * matches `dwelling` and turns it into `liveing`.
 */
function word(pattern: string, replacement: string): Rule {
    return { pattern: new RegExp(`\\b${pattern}\\b`, "gi"), replacement, followCase: true };
}

/** A rule applied exactly as written, for anything using capture groups. */
function raw(pattern: string, replacement: string, flags = "g"): Rule {
    return { pattern: new RegExp(pattern, flags), replacement, followCase: false };
}

function applyRules(text: string, rules: readonly Rule[]): string {
    return rules.reduce(
        (current, { pattern, replacement, followCase }) =>
            current.replace(pattern, (...args: unknown[]) => {
                const match = args[0] as string;
                const filled = replacement.replace(
                    /\$(\d)/g,
                    (_token, index: string) => (args[Number(index)] as string | undefined) ?? "",
                );
                if (!followCase || !/^[A-Z]/.test(match)) return filled;
                return filled.charAt(0).toUpperCase() + filled.slice(1);
            }),
        text,
    );
}

/**
 * Undoes two blanket substitutions baked into the source text itself.
 *
 * `beloved` was replaced with `Dear friends` in every position. That is right
 * for the vocative the epistles open on -- `Beloved, let us love one another`
 * -- and wrong in all 104 other places, where it left God saying `You are my
 * Dear friends Son`. The vocative is the case that opens a sentence and is
 * followed by a comma; everything else goes back to `beloved`.
 *
 * `Yahweh` was replaced with `God`, which is deliberate and consistent, but it
 * turned `Yahweh the God of Israel` into `God the God of Israel`. Only that
 * phrase is repaired -- `Or is God the God of Jews only?` is correct as written.
 */
function repairSource(text: string): string {
    return text
        .replace(
            /([.!?]\s+|“)?Dear friends(,)?/g,
            (
                _match: string,
                lead: string | undefined,
                comma: string | undefined,
                offset: number,
            ) => {
                const opening = lead ?? "";
                // Opening the verse counts too, which `^` cannot signal here: it
                // captures an empty string, the same thing a miss captures.
                const opensSentence = opening !== "" || offset === 0;
                if (opensSentence && comma === ",") return `${opening}Dear friends,`;
                return `${opening}beloved${comma ?? ""}`;
            },
        )
        .replace(/\bGod the God of Israel\b/g, "the God of Israel")
        // `let us` was contracted to `Let’s` in all 152 places it appears, which
        // capitalized it mid-sentence and flattened the `allow us` sense with
        // the hortative one: `Pharaoh stubbornly refused to Let’s go`.
        // `n’t` carries no leading word boundary: it sits inside `wouldn’t`.
        .replace(/(\bto|n’t|\b[Pp]lease)(\s+)Let’s\b/g, "$1$2let us")
        .replace(/([^.!?“‘]\s+)Let’s\b/g, "$1let’s");
}

/**
 * Structural repairs that run before anything reads the words.
 *
 * The source carries psalm superscriptions and `Selah` as HTML, but the API
 * serves plain text and the reader prints it as plain text, so those tags
 * reached readers verbatim. The source also mixes typewriter and typographic
 * apostrophes, which every rule below would otherwise have to spell twice.
 */
function normalize(text: string): string {
    return text
        .replace(/<[^>]+>/g, " ")
        .replace(/(\w)'(\w)/g, "$1’$2")
        .replace(/(s)'(\s|$)/g, "$1’$2")
        .replace(/\s+([,.;:!?])/g, "$1")
        .replace(/([,.;:!?]) ’/g, "$1’")
        .replace(/\s{2,}/g, " ")
        .trim();
}

/**
 * Sentence length, which is the widest gap between this voice and the source.
 *
 * The source averages 24 words a verse and runs past 25 in 39% of them, because
 * it strings independent clauses together on semicolons -- 8,337 of them. Spoken
 * English does not sustain a clause that long; it stops and starts again. Every
 * word-level rule below can fire and the verse still reads as written prose
 * while that punctuation stands, so the split runs before any of them.
 *
 * A semicolon only becomes a full stop when both sides could stand alone, which
 * is approximated as five words each. That guard is what keeps the genealogies
 * intact: `Reuben; Simeon; Levi` is a list that happens to use semicolons, not a
 * run of clauses, and splitting it yields one-word sentences. A clause opening
 * on a conjunction is continuing the thought rather than starting a new one, so
 * it takes a comma instead.
 */
function countWords(text: string): number {
    return text.trim().split(/\s+/).filter(Boolean).length;
}

function splitClauses(text: string): string {
    const parts = text.split(/;\s+/);
    if (parts.length === 1) return text;
    return parts.reduce((joined, part, index) => {
        if (index === 0) return part;
        const previous = parts[index - 1] ?? "";
        if (countWords(previous) < 5 || countWords(part) < 5) return `${joined}; ${part}`;
        if (/^(and|but|or|nor|yet|for|so|then)\b/i.test(part)) return `${joined}, ${part}`;
        return `${joined}. ${part}`;
    }, "");
}

/**
 * Picks one of several replacements for a rule that would otherwise repeat the
 * same phrase over a thousand times.
 *
 * The choice is a hash of the verse rather than a counter or a random draw, so
 * a given verse lands on the same variant on every run and editing one rule
 * cannot shuffle the wording of unrelated verses.
 */
function hashOf(text: string): number {
    let hash = 0;
    for (let index = 0; index < text.length; index += 1) {
        hash = (hash * 31 + text.charCodeAt(index)) >>> 0;
    }
    return hash;
}

function variantFor(text: string, choices: readonly string[]): string {
    return choices[hashOf(text) % choices.length] as string;
}

/**
 * Connectives, handled first because later rules would rewrite what they emit.
 *
 * A capitalized connective opens a sentence and swaps cleanly for a spoken one.
 * A lowercase `therefore` is an interjection wedged inside a clause, where `so`
 * is ungrammatical -- `There is therefore now no condemnation` had become
 * `There is so now no condemnation`, and `The Jews therefore complained` had
 * become `The Jews so complained`. Dropping it is the only rewrite that is
 * grammatical in every position; the clause still carries the inference.
 */
const connectives: readonly Rule[] = [
    raw("\\bNow,?\\s+therefore,?\\s+", "So now, "),
    raw("\\bTherefore,?\\s+", "So, "),
    raw("\\bNevertheless,?\\s+", "Still, "),
    raw("\\bMoreover,?\\s+", "Also, "),
    raw("\\bsaid moreover\\b", "also said"),
    raw("\\bmoreover,?\\s+", ""),
    // A verse that opens on `therefore` is continuing the previous verse's
    // sentence, which is the one position where `so` is grammatical.
    raw("^therefore\\b", "so"),
    // A `therefore` fenced by commas on both sides has to be matched before the
    // rule below, which sees only the space in front of it and strips the word
    // while leaving both fences standing: `Whoever, therefore, will break`
    // became `Whoever,, will break`.
    raw(",\\s*therefore,\\s*", ", "),
    raw("\\s+therefore\\b(?=[;,.!?”’\"])", ""),
    raw("\\s+therefore,?\\s+", " "),
    raw("\\bnevertheless\\b", "even so"),
];

/** Phrases that only read right when the whole phrase moves at once. */
const idioms: readonly Rule[] = [
    word("Most certainly,? I tell you", "for real, I’m telling you"),
    word("Most certainly", "for real"),
    word("it came to pass", "here’s what happened"),
    // `panic` is intransitive, so this has to run first: `Do not be afraid of
    // the things which you are about to suffer` cannot become `Don’t panic of`.
    word("be afraid of", "be scared of"),
    word("Do not be afraid", "don’t panic"),
    word("don’t be afraid", "don’t panic"),
    word("Fear not", "don’t panic"),
    word("sore afraid", "seriously scared"),
    word("be strong and courageous", "be strong and brave"),
    word("be strong and of good courage", "be strong and brave"),
    word("of good courage", "brave"),
    word("in the midst of", "in the middle of"),
    word("by reason of", "because of"),
    word("laid hold of", "grabbed"),
    word("laid hold on", "grabbed"),
    word("a great multitude", "a huge crowd"),
    word("great multitudes", "huge crowds"),
    word("God saw that it was good", "God looked it over and knew it was good"),
    word("God saw everything that he had made", "God checked out everything he made"),
    word("and, look, it was very good", "and honestly, it was all pretty awesome"),
    word("and it was so", "and that’s exactly what happened"),
    word("It was so", "That’s exactly what happened"),
    // Spoken as `day one`, not `day first`, so the ordinal is swapped for the
    // cardinal rather than carried through the rewrite.
    ...Object.entries({
        first: "one", second: "two", third: "three", fourth: "four",
        fifth: "five", sixth: "six", seventh: "seven",
    }).map(([ordinal, cardinal]) =>
        raw(
            `\\bThere was evening and there was morning, (?:a|the) ${ordinal} day\\.`,
            `Then evening came, morning followed, and just like that, day ${cardinal} wrapped up.`,
            "gi",
        )),
];

/**
 * Sentence shape rather than word choice. These are what make a verse read as a
 * report instead of as speech: possession spelled out as `the son of Jesse`,
 * relative clauses built on `he who`, the `, saying,` that introduces every
 * quotation, and the sentence-initial `For` that no one says out loud.
 *
 * The possessive rules require a capitalized name after `of`, which is what
 * keeps `the Son of God` and `the son of man` out of their way.
 */
const syntax: readonly Rule[] = [
    raw("\\bthe children of Israel\\b", "the Israelites"),
    // The `(?![\\w’])` is what keeps `the sons of Abraham’s concubines` intact: the
    // name there is already possessive and owns the noun after it, not `sons`.
    // It has to reject a word character too, or the group just backtracks to
    // `Abraha` so that the next character is not an apostrophe.
    raw("\\bthe children of ([A-Z]\\w+)(?![\\w’])", "$1’s people"),
    raw("\\bthe children of men\\b", "people"),
    raw("\\bthe children of your people\\b", "your people"),
    raw("\\bthe children of the\\b", "the people of the"),
    raw("\\bthe son of ([A-Z]\\w+)(?![\\w’])", "$1’s son"),
    raw("\\bthe sons of ([A-Z]\\w+)(?![\\w’])", "$1’s sons"),
    raw("\\bthe daughter of ([A-Z]\\w+)(?![\\w’])", "$1’s daughter"),
    raw("\\bthe daughters of ([A-Z]\\w+)(?![\\w’])", "$1’s daughters"),
    raw("\\bthe wife of ([A-Z]\\w+)(?![\\w’])", "$1’s wife"),
    raw("\\bspoke to ([\\w’]+), saying,", "told $1,"),
    raw(",\\s*saying,\\s*(?=[“‘])", ", "),
    // `talked to Noah and to his sons with him, saying,` runs into the quotation
    // in the next verse, so the colon does the introducing on its own.
    raw(",\\s*saying,\\s*$", ":"),
    // Moving `says` in front of the subject only works while the subject is a
    // plain name. `Thus says the high and lofty One who inhabits eternity, whose
    // name is Holy` would strand the appositive after the verb, so a subject
    // carrying a relative clause keeps the source's wording.
    raw("\\bThus says ((?:(?! who | which )[^,:;.]){1,70}?)([,:.]|$)", "Here’s what $1 says$2"),
    raw("\\bthus says ((?:(?! who | which )[^,:;.]){1,70}?)([,:.]|$)", "here’s what $1 says$2"),
    // `For the Chief Musician` heads 55 psalms and means `dedicated to`, not
    // `because` -- the only sentence-initial `For` in the text that is not causal.
    raw("(^|[.!?]\\s+|[“‘])For\\b(?! the Chief Musician)", "$1Because"),
    // `the one who` rather than `anyone who`, because `he who` is generic in
    // `he who has ears` but refers to one person in `he who descended out of
    // heaven`. Only `the one who` is right in both, and nothing in the sentence
    // says which is meant. `whoever` below is unambiguously generic.
    word("he who", "the one who"),
    word("him who", "the one who"),
    word("those who", "people who"),
    word("whoever", "anyone who"),
];

/**
 * `Is it not` and `Do you not` are how the source asks a question. Only a `not`
 * sitting directly after the subject is contracted, so a `not` that belongs to
 * a later clause is left where it is.
 */
const NEGATABLE: Readonly<Record<string, string>> = {
    Is: "Isn’t", Are: "Aren’t", Was: "Wasn’t", Were: "Weren’t",
    Do: "Don’t", Does: "Doesn’t", Did: "Didn’t",
    Have: "Haven’t", Has: "Hasn’t", Had: "Hadn’t",
    Can: "Can’t", Could: "Couldn’t", Will: "Won’t",
    Would: "Wouldn’t", Should: "Shouldn’t",
};
const SUBJECTS = "I|you|he|she|it|we|they|there|God";
const negatedQuestions: readonly Rule[] = Object.entries(NEGATABLE).flatMap(
    ([auxiliary, contracted]) => [
        raw(`\\b${auxiliary} (${SUBJECTS}) not\\b`, `${contracted} $1`),
        raw(
            `\\b${auxiliary.toLowerCase()} (${SUBJECTS}) not\\b`,
            `${contracted.charAt(0).toLowerCase()}${contracted.slice(1)} $1`,
        ),
    ],
);

/** How people speak and move, which is most of what makes a verse sound stiff. */
const register: readonly Rule[] = [
    raw("\\bsaid to (them|him|her|me|us)\\b", "told $1"),
    // `told X and to Y` strands the preposition the dropped `said to` governed.
    raw("\\btold ((?:[\\w’]+\\s+){0,2}[\\w’]+) and to\\b", "told $1 and"),
    word("answered and said", "answered"),
    // `God talked to Moses, “Depart…` reads wrong; introducing speech wants `told`.
    raw("\\bspoke to (\\w+)(?=,\\s*[“])", "told $1"),
    word("spoke to", "talked to"),
    word("cried out", "yelled"),
    // `Until I arose a mother in Israel` is not `got up`; restrict to the
    // positions where the verb is intransitive.
    raw("\\b([Hh]e|[Ss]he|[Tt]hey|[Ww]e|I|[Yy]ou) arose\\b(?=[,.;!?]|\\s+(and|from|early|up|to|in|at|against|before))", "$1 got up"),
    word("went up", "headed up"),
    word("went down", "headed down"),
    word("departed", "headed out"),
    word("tarried", "stuck around"),
    word("straightway", "right away"),
    word("immediately", "right away"),
    word("beheld", "saw"),
    word("ceased", "stopped"),
    word("perceived", "figured out"),
    word("multitudes", "crowds"),
    word("multitude", "crowd"),
    word("was very angry", "was seriously mad"),
    word("were very angry", "were seriously mad"),
    word("was wroth", "was furious"),
    word("were wroth", "were furious"),
    word("astonished", "blown away"),
    word("amazed", "blown away"),
    word("exceedingly", "seriously"),
    word("utterly", "completely"),
    word("grievous", "rough"),
    word("valiant", "tough"),
    word("countenance", "face"),
    word("raiment", "clothes"),
    word("garments", "clothes"),
    word("henceforth", "from now on"),
    word("for this reason", "that’s why"),
    word("you all", "you guys"),
    word("dwelt", "lived"),
    word("dwells", "lives"),
    word("dwell", "live"),
    word("lifted up his eyes", "looked up"),
    word("lifted up her eyes", "looked up"),
    word("lifted up their eyes", "looked up"),
    word("lifted up", "raised"),
    word("went forth", "headed out"),
    word("went out", "headed out"),
    word("at hand", "almost here"),
    word("according to", "based on"),
    word("in the sight of", "in front of"),
    word("upon", "on"),
    word("entreated", "begged"),
    word("reigned", "ruled"),
    word("struck", "hit"),
    word("wilderness", "desert"),
    word("Yes(?! and no)(?!’)", "Yeah"),
    word("indeed", "honestly"),
    word("surely", "definitely"),
    word("congregation", "community"),
    word("statutes", "rules"),
    word("ordinances", "rules"),
    word("commandments", "commands"),
    word("iniquities", "wrongdoings"),
    word("iniquity", "wrongdoing"),
    word("transgressions", "wrongs"),
    word("perish", "die"),
    word("wrath", "rage"),
    word("supplications", "pleas"),
    word("supplication", "plea"),
    word("reproach", "shame"),
    word("posterity", "descendants"),
    word("victuals", "food"),
    word("damsel", "girl"),
    word("husbandman", "farmer"),
    word("thence", "from there"),
    word("hither", "here"),
    word("whither", "where"),
    word("inhabitants of", "people of"),
    word("in order that", "so"),
    word("to the end that", "so"),
    // `that you may live` is a purpose clause; speech says `so you can live`.
    word("that (I|you|we|they|he|she|it) may", "so $1 can"),
    // The vocative `O` survives only in hymns: `O God, hear me` is just `God`.
    raw("\\bO ([A-Z])", "$1"),
    word("neither did I", "and I didn’t"),
    word("neither do I", "and I don’t"),
    word("receded", "went down"),
    word("decreased", "went down"),
];

/**
 * Contractions last, so they also tighten the wording the rules above produced.
 * Negatives run before the `to be` forms so `is not` lands on `isn’t` instead of
 * the clumsier `it’s not` that the `it is` rule would otherwise reach first.
 *
 * These go through `word()` rather than a plain replace because a verse may open
 * on one: `There is now no condemnation` has to keep its capital.
 */
const contractions: readonly Rule[] = [
    word("do not", "don’t"),
    word("does not", "doesn’t"),
    word("did not", "didn’t"),
    word("cannot", "can’t"),
    word("can not", "can’t"),
    word("will not", "won’t"),
    word("shall not", "won’t"),
    word("is not", "isn’t"),
    word("are not", "aren’t"),
    word("was not", "wasn’t"),
    word("were not", "weren’t"),
    word("has not", "hasn’t"),
    word("have not", "haven’t"),
    word("had not", "hadn’t"),
    word("would not", "wouldn’t"),
    word("could not", "couldn’t"),
    word("should not", "shouldn’t"),
    // No `let us` rule: the source has none left to contract, and adding one
    // would undo the `allow us` restoration above.
    word("I am", "I’m"),
    word("you are", "you’re"),
    word("we are", "we’re"),
    word("they are", "they’re"),
    word("he is", "he’s"),
    word("she is", "she’s"),
    word("it is", "it’s"),
    word("that is", "that’s"),
    word("there is", "there’s"),
    word("what is", "what’s"),
    // `Who is it?` is idiomatic; `Who’s it?` is not, so that one stays uncontracted.
    raw("\\b([Ww])ho is\\b(?! it\\b)", "$1ho’s"),
    raw("(’m|’re|’s) going to\\b", "$1 gonna"),
];

/**
 * A participle, near enough. `have` and `had` only contract in front of one:
 * `they have driven him away` is `they’ve driven him away`, but `I have a son`
 * is not `I’ve a son`, and only the following word tells the two apart.
 */
const PARTICIPLE =
    "(?:\\w+(?:ed|en)\\b|been|gone|done|come|become|seen|given|taken|made|said|told|known" +
    "|heard|spoken|written|put|set|sent|found|brought|left|kept|held|got|met|lost|paid|led" +
    "|felt|built|sold|begun|forgotten|forgiven|drawn|thrown|grown|shown|dealt|slept|sworn)";
const SPEAKERS = "I|you|we|they|he|she|it";

/**
 * The perfect tenses, which the source always spells out in full. Contracting
 * them is most of what separates `they have driven him away` from speech.
 */
const perfects: readonly Rule[] = [
    raw(`\\b(I|you|we|they) have (?=${PARTICIPLE})`, "$1’ve ", "gi"),
    raw(`\\b(he|she|it) has (?=${PARTICIPLE})`, "$1’s ", "gi"),
    raw(`\\b(${SPEAKERS}) had (?=${PARTICIPLE})`, "$1’d ", "gi"),
    raw(`\\b(${SPEAKERS}) would\\b`, "$1’d", "gi"),
];

/**
 * The source states the future with `will`, which is how writing does it; speech
 * uses `going to`. This runs after the contractions so `will not` has already
 * become `won’t` and never reaches these rules as a stray `will`.
 *
 * Only pronoun subjects are rewritten. A noun subject would need its number
 * resolved to pick `is` or `are`, and guessing that produces `the crowds is
 * gonna`, so those keep `will`.
 */
const futures: readonly Rule[] = [
    // `never` sits between the auxiliary and the verb, where `gonna` cannot
    // follow it: `you will never see them` has to become `you’re never gonna
    // see them`, not `you’re gonna never see them`. These run first so the
    // bare rules below never meet a `will` that owns a `never`.
    raw("\\bI will never\\b", "I’m never gonna"),
    word("(you|we|they) will never", "$1’re never gonna"),
    word("(he|she|it) will never", "$1’s never gonna"),
    raw("\\bGod will never\\b", "God’s never gonna"),
    raw("\\bI will\\b", "I’m gonna"),
    word("you will", "you’re gonna"),
    word("he will", "he’s gonna"),
    word("she will", "she’s gonna"),
    word("it will", "it’s gonna"),
    word("we will", "we’re gonna"),
    word("they will", "they’re gonna"),
    word("there will be", "there’s gonna be"),
    word("who will", "who’s gonna"),
    raw("\\bGod will\\b", "God’s gonna"),
    raw("\\bWill you\\b", "Are you gonna"),
    raw("\\bwill you\\b", "are you gonna"),
    word("must not", "can’t"),
    raw("\\b(I|you|we|they) must\\b", "$1 gotta"),
    raw("\\b([Hh]e|[Ss]he|[Ii]t) must\\b", "$1’s gotta"),
];

/**
 * Restores the capital on any sentence a swap opened in lowercase.
 *
 * Verse-initial letters are deliberately left alone: the source starts a verse
 * lowercase when it continues the previous verse's sentence, and capitalizing
 * those would invent sentence breaks that aren't there.
 */
function recapitalize(text: string): string {
    return text
        .replace(
            /([.!?]\s+["“‘]?\s*)([a-z])/g,
            (_match, lead: string, letter: string) => lead + letter.toUpperCase(),
        )
        // Opening a quotation starts a sentence, but the source does not always
        // capitalize it: `saying, “will I go up against the Philistines?`
        // ...but a quotation that resumes mid-sentence starts on a conjunction
        // and stays lowercase: `“Look, I’m against you,” says God, “and I will
        // lift your skirts` is one sentence, not two.
        .replace(
            /(,\s+[“‘])(?!(?:and|but|or|nor|yet|for|so)\b)([a-z])/g,
            (_match, lead: string, letter: string) => lead + letter.toUpperCase(),
        );
}

/**
 * The attention-getter, which the source spells `look,` in 1,351 places and
 * which no one says out loud. It is not filler -- it marks the thing the
 * sentence wants you to notice -- so it is replaced rather than deleted, and
 * replaced with more than one phrase so a reader moving through a chapter does
 * not meet the same four words in every third verse.
 *
 * Sentence-initial and mid-sentence positions take different sets: an opener
 * can carry a full phrase, while a clause already underway only has room for a
 * short aside. A colon and a closing quote open a sentence here too -- the
 * source introduces reported speech with both -- so they lead the opener set
 * alongside the full stops.
 */
const OPENING_ATTENTION = ["Check it out,", "Okay so,", "Listen,", "Real talk,"] as const;
const INLINE_ATTENTION = ["check it out", "listen", "for real", "no joke"] as const;

function colloquialize(text: string): string {
    return text
        .replace(/(^|[.!?:]\s+|[“‘”]\s*)Look,/g, (_match, lead: string) =>
            `${lead}${variantFor(text, OPENING_ATTENTION)}`)
        .replace(/\blook,/g, () => `${variantFor(text, INLINE_ATTENTION)},`)
        // `They said` is the one speech tag with no divine subject available to
        // it, so it is the one that can take a casual verb without deciding how
        // God is quoted. Named and singular speakers keep `said`.
        .replace(/\b([Tt]hey) said,(?=\s*[“‘])/g, (match, subject: string) =>
            variantFor(text, ["were like", "said"]) === "said"
                ? match
                : `${subject} were like,`);
}

/**
 * Intensifiers, which the source states with `very` and `great` and speech
 * states with a stronger word. Both are restricted to an allowlist of what may
 * follow them: `very` also modifies quantities and nouns in this text -- `very
 * day`, `very much` -- where `seriously` is wrong or clumsy, and `great news`
 * is already how anyone would say it.
 */
const intensifiers: readonly Rule[] = [
    word("very great", "seriously huge"),
    word("very much", "a whole lot"),
    word("very many", "a ton of"),
    word("very small", "tiny"),
    word("very little", "tiny"),
    word("very (angry|afraid|good|beautiful|old|young|heavy|deep|high|far|grievous|sore)", "seriously $1"),
    word("great slaughter", "massive slaughter"),
    word("great city", "huge city"),
    word("great assembly", "huge crowd"),
    word("great multitude", "huge crowd"),
    word("great joy", "serious joy"),
    word("great fear", "serious fear"),
    word("great stone", "huge stone"),
    word("great house", "huge house"),
    word("great mountain", "huge mountain"),
];

/**
 * The slang layer, aimed at what the source actually says often rather than at
 * a list of slang picked in the abstract. The words below were chosen off a
 * frequency pass over `base.json`: `man` appears 2,226 times, `house` 1,936,
 * `afraid` 254, and swapping those moves far more verses than swapping a rare
 * word ever could.
 *
 * The guards matter more than the swaps. `house` is a building in `his house`
 * and a lineage in `the house of Israel`, so only a possessed house becomes a
 * crib. `man` is a person in `the man`, a title in `the Son of Man`, and an
 * office in `the man of God`, so only the bare definite `the man` moves. Every
 * rule here is anchored to the position where the casual reading is the right
 * one, which is why they are phrases rather than words.
 */
const slang: readonly Rule[] = [
    raw("\\bthe man\\b(?! of God)", "the dude"),
    raw("\\bThe man\\b(?! of God)", "The dude"),
    raw("\\bthe men\\b(?! of God)", "the guys"),
    raw("\\bThe men\\b(?! of God)", "The guys"),
    raw("\\b(his|her|my|your|their|our) house\\b", "$1 crib"),
    word("was afraid", "was shook"),
    word("were afraid", "were shook"),
    word("is afraid", "is shook"),
    word("are afraid", "are shook"),
    word("was glad", "was hyped"),
    word("were glad", "were hyped"),
    word("rejoiced", "was hyped"),
    word("rejoice", "be hyped"),
    word("enemies", "opps"),
    word("enemy", "opp"),
    word("(his|her|my|your|their|our) friend", "$1 bro"),
    word("evil (man|men|people|things|way|ways)", "shady $1"),
    word("foolish", "clueless"),
    word("(a|the) fool", "$1 clown"),
    word("wicked", "shady"),
    word("was angry", "was heated"),
    word("were angry", "were heated"),
    word("beautiful", "gorgeous"),
    word("(was|is|were|are) good", "$1 solid"),
    word("understood", "caught on"),
    word("in truth", "no cap"),
    word("truly", "no cap"),
    word("assuredly", "no cap"),
    word("(a|the) great deal", "$1 whole lot"),
    word("plenty of", "a ton of"),
    word("hurried", "booked it"),
    word("fled", "bounced"),
    word("(gathered|assembled) together", "linked up"),
    word("made a covenant", "made a pact"),
    word("(was|is) pleased with", "$1 vibing with"),
    word("took counsel", "talked it out"),
    word("mocked", "clowned on"),
    word("boast", "flex"),
    word("boasts", "flexes"),
    word("boasting", "flexing"),
];

/**
 * The saturation guarantee.
 *
 * The rules above raise the slang density but cannot promise it: a verse of
 * plain narrative may match none of them and come out reading like any other
 * translation. The calibration target is every verse carrying the voice, so
 * this counts what the pipeline actually produced and tops up whatever falls
 * short.
 *
 * Prepending an opener demotes the verse's first word out of sentence-initial
 * position, which is only a reason to lowercase it if it was capitalized for
 * that position alone. `Jesus wept` and `God said` are capitalized for a second
 * reason that outlives the move, so only a word on the common-opener list below
 * is lowercased and every other first word keeps the capital it arrived with.
 *
 * The two injection sites are chosen by what the verse allows, not by
 * preference. An opener needs a real sentence start -- a verse beginning
 * lowercase is continuing the previous verse's sentence and cannot take one --
 * and a closing tag needs a verse that ends on its own punctuation rather than
 * inside a quotation, where the tag would land outside the speaker's words. A
 * verse that allows neither keeps whatever density the rules gave it.
 */
const SLANG_MARKERS =
    /\b(no cap|for real|fr|lowkey|highkey|bro|bruh|fam|dude|dudes|guys|crib|opp|opps|shook|hyped|heated|vibe|vibes|vibing|flex|flexes|flexing|clown|clowned|clueless|shady|solid|gorgeous|bounced|booked it|linked up|clowned on|caught on|gonna|gotta|wanna|yeah|honestly|seriously|straight-up|a ton of|a whole lot|huge|massive|check it out|okay so|listen|real talk|no joke|were like|was like|top dog|goat)\b/gi;

/**
 * The proper nouns, read off the source rather than listed by hand.
 *
 * A hand-written list is the wrong shape for this: the text carries thousands
 * of names, and the words that must NOT be protected are the far larger set of
 * ordinary words that happen to open a sentence -- `Trust in God` and `Praise
 * his name` are imperatives, not names, and a list of names cannot say so.
 *
 * The source answers the question itself. A word that is capitalized in the
 * middle of a sentence, where nothing but the word itself justifies the
 * capital, is a name; a word that appears lowercase in that position is not.
 * Sampling only mid-sentence positions is the whole trick -- every word is
 * capitalized at a sentence start, so those positions carry no information.
 * `God` clears the threshold on thousands of mid-sentence occurrences, while
 * `Trust` appears lowercase in almost all of its and stays demotable.
 */
function collectProperNouns(verses: readonly Verse[]): ReadonlySet<string> {
    const capitalized = new Map<string, number>();
    const total = new Map<string, number>();
    for (const verse of verses) {
        // A preceding lowercase word or comma is what marks the position as
        // mid-sentence; a preceding `.`, `?`, `!` or quotation mark does not.
        for (const [, word] of verse.text.matchAll(/(?:[a-z’]+|,)\s+([A-Za-z’]+)/g)) {
            const key = (word as string).toLowerCase();
            total.set(key, (total.get(key) ?? 0) + 1);
            if (/^[A-Z]/.test(word as string)) {
                capitalized.set(key, (capitalized.get(key) ?? 0) + 1);
            }
        }
    }
    const names = new Set<string>();
    for (const [word, seen] of total) {
        // Four occurrences is enough to tell a name from a typo, and a word
        // capitalized in 80% of them is not being capitalized for its position.
        if (seen >= 4 && (capitalized.get(word) ?? 0) / seen >= 0.8) names.add(word);
    }
    return names;
}

/** Lowercases the displaced first word unless the source treats it as a name. */
function demote(sentence: string): string {
    const first = sentence.match(/^[A-Za-z’]+/)?.[0] ?? "";
    if (properNouns.has(first.toLowerCase())) return sentence;
    return sentence.charAt(0).toLowerCase() + sentence.slice(1);
}

const OPENED_ALREADY =
    /^[“‘]?(okay so|real talk|not gonna lie|lowkey|listen|check it out|no joke|for real)\b/i;

const DENSITY_TARGET = 2;
const DENSITY_OPENERS = ["Okay so,", "Real talk,", "Not gonna lie,", "Lowkey,", "Listen,"] as const;
const DENSITY_TAGS = ["no cap", "for real", "fr", "straight-up"] as const;

function slangCount(text: string): number {
    return (text.match(SLANG_MARKERS) ?? []).length;
}

function ensureDensity(text: string): string {
    let result = text;
    if (slangCount(result) >= DENSITY_TARGET) return result;

    // The opener goes inside an opening quotation mark, so a verse that is all
    // speech has the speaker say it rather than the narrator.
    // A verse that already opens on a discourse marker got it from
    // `colloquialize`, which had a `look,` to convert. Prepending a second one
    // stacks them -- `Lowkey, okay so, ...` -- so that verse skips straight to
    // the closing tag for whatever density it still needs.
    const opener = variantFor(text, DENSITY_OPENERS);
    const openable = /^[“‘]?[A-Z]/.test(result) && !OPENED_ALREADY.test(result);
    if (openable) {
        result = /^[“‘]/.test(result)
            ? `${result.charAt(0)}${opener} ${demote(result.slice(1))}`
            : `${opener} ${demote(result)}`;
    }
    if (slangCount(result) >= DENSITY_TARGET) return result;

    // `.trim()` has already run, so a trailing quotation mark means the verse
    // ends inside speech and the tag has nowhere to go that is still in it.
    if (/[.!?]$/.test(result)) {
        const tag = variantFor(`${text}#tag`, DENSITY_TAGS);
        result = `${result.slice(0, -1)}, ${tag}${result.slice(-1)}`;
    }
    return result;
}

function modernize(text: string): string {
    const clean = repairSource(normalize(text));
    const exact = exactRewrites.get(clean);
    if (exact) return exact;

    const spoken = colloquialize(splitClauses(clean));
    const rewritten = applyRules(spoken, [
        ...connectives,
        ...idioms,
        ...syntax,
        ...negatedQuestions,
        ...register,
        ...intensifiers,
        ...slang,
        ...contractions,
        ...futures,
        ...perfects,
    ]);
    const tidied = recapitalize(rewritten).replace(/\s{2,}/g, " ").trim();
    return ensureDensity(tidied);
}

const parsed: unknown = JSON.parse(await readFile(basePath, "utf8"));
if (!Array.isArray(parsed)) throw new Error(`${basePath} must contain an array.`);
const base = parsed as Verse[];
const properNouns = collectProperNouns(base);

const rendered = base.map((verse) => ({
    ...verse,
    text: referenceRewrites.get(`${verse.book}:${verse.chapter}:${verse.verse}`) ??
        modernize(verse.text),
}));

const changed = rendered.filter((verse, index) => verse.text !== base[index]?.text).length;
await writeFile(outputPath, JSON.stringify(rendered), "utf8");
console.log(
    `Rendered ${changed.toLocaleString()} of ${rendered.length.toLocaleString()} GENZ verses ` +
        `(${referenceRewrites.size} hand-written) from base.json.`,
);
