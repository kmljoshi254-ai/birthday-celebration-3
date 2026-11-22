import { TimelineEvent, MemoryPhoto, InsideJoke, Award } from "../friendship";

export const page3Config = {
  title: "little moments...",
  subtitle: "some things are better when you look a little closer.",
  envelopeLabel: "for Ayooooo... ♡",
  boxLabel: "little things",
  timeline: [
    {
        "year": "2021",
        "title": "Matcha Theft Attempt",
        "text": "You literally tried to swipe the last matcha latte from the counter. When I called you out, you laughed and spent the next three hours explaining why birds aren't real.",
        "image": "/images/timeline_1.png",
        "tag": "First Encounter"
    },
    {
        "year": "2023",
        "title": "The Road Trip Adventure",
        "text": "We went on a road trip, our GPS died, and we got stuck in that weird town. We had to eat questionable snacks for dinner and laughed all night in the car.",
        "image": "/images/timeline_2.png",
        "tag": "Pure Chaos"
    },
    {
        "year": "2025",
        "title": "Late Night Meltdown",
        "text": "Studying on negative sleep, laughing hysterically at a blank wall because everything seemed funny at 4 AM, and planning our future private island.",
        "image": "/images/timeline_3.png",
        "tag": "Unstoppable Duo"
    }
] as TimelineEvent[],
  memories: [
    {
        "src": "/images/gallery_1.png",
        "caption": "Picnic where geese stole our sandwiches 🌸",
        "rotation": -5,
        "date": "Spring '22"
    },
    {
        "src": "/images/gallery_2.png",
        "caption": "Extremely blurred selfie (peak quality)",
        "rotation": 4,
        "date": "New Year's Eve"
    },
    {
        "src": "/images/gallery_3.png",
        "caption": "Baking experiment (that left carbon in the oven)",
        "rotation": -3,
        "date": "Rainy Tuesday"
    },
    {
        "src": "/images/gallery_4.png",
        "caption": "Losing our hearing at that basement concert 🎸",
        "rotation": 7,
        "date": "Oct 2024"
    },
    {
        "src": "/images/gallery_5.png",
        "caption": "Sunburn level: cooked lobster ☀️",
        "rotation": -6,
        "date": "Summer '23"
    },
    {
        "src": "/images/gallery_6.png",
        "caption": "Pretending to study in the library",
        "rotation": 3,
        "date": "Exam Season"
    },
    {
        "src": "/images/gallery_7.png",
        "caption": "Staring at abstract art pretending we get it 🎨",
        "rotation": -2,
        "date": "Jan 2025"
    },
    {
        "src": "/images/gallery_8.png",
        "caption": "The matching keychains we both lost instantly",
        "rotation": 5,
        "date": "June '25"
    }
] as MemoryPhoto[],
  insideJokes: [
    {
        "question": "“Can I get exactly 3.5 fries?” 😂",
        "answer": "Trying to order a fractional number of fries at the drive-thru and confusing the cashier for a solid 10 minutes.",
        "reaction": "🍟"
    },
    {
        "question": "“3:14 AM Voice Note”",
        "answer": "That voicemail consisting entirely of garbage disposal noises that you sent because you thought it sounded like a dying dragon.",
        "reaction": "🐉"
    },
    {
        "question": "“The Bathroom Hair-Dye Tragedy”",
        "answer": "Our DIY purple hair dye project that permanently stained the bathtub, walls, and ceiling. RIP deposit money.",
        "reaction": "🧼"
    },
    {
        "question": "“you had to be there.”",
        "answer": "The 5-hour debate on hot dog taxonomy with a full presentation to convince each other.",
        "reaction": "🌭"
    }
] as InsideJoke[],
  awards: [
    {
        "title": "Agents of Chaos",
        "text": "For buying matching custom onesies at 2:00 AM on a school night.",
        "icon": "🏆"
    },
    {
        "title": "Professional Arguments",
        "text": "847 debates and counting, including the legendary matcha vs taro debate.",
        "icon": "🥇"
    },
    {
        "title": "Shared Brain Cell Award",
        "text": "Obviously. Nothing comes close to our telepathic brain cell sharing.",
        "icon": "🎖️"
    },
    {
        "title": "Vocabulary Limitation",
        "text": "A 100% chance of only saying 'Bro' and 'Dude' in every chat.",
        "icon": "⭐"
    }
] as Award[],
  surprise: {
    "title": "ONE LAST THING...",
    "prompt": "OPEN THE BOX",
    "revealText": "SURPRISE! YOU OWE ME TACOS.",
    "images": [
        "/images/surprise_1.png",
        "/images/surprise_2.png"
    ]
},
};
