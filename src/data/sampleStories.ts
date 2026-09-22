import { Story } from '../types';

export const SAMPLE_STORIES: Story[] = [
  {
    id: 'barnaby-starry-lantern',
    title: 'Barnaby & The Starry Lantern',
    author: 'Story Magic',
    ageGroup: '3-5',
    theme: 'Forest Adventure',
    coverColor: 'from-indigo-600 via-purple-600 to-pink-500',
    description: 'Barnaby the little owl finds a glowing star that fell into the mossy forest. Together with his friends, they help it journey back to the sky!',
    coverImageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    pages: [
      {
        id: 'b1',
        pageNumber: 1,
        text: 'Deep in the Whispering Woods, Barnaby the fluffy little owl flapped his soft purple wings. Night had just fallen, and the moon shone like a giant silver coin in the sky.',
        illustrationPrompt: 'A tiny cute purple owl with big shiny yellow eyes perched on a glowing tree branch in an enchanted night forest with silver moonlight and glowing mushrooms.',
        imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
        soundEffect: 'sparkle'
      },
      {
        id: 'b2',
        pageNumber: 2,
        text: 'Plop! Something sparkled in the soft green moss below. Barnaby swooped down quietly. It was a tiny lost star, giggling softly and twinkling with warm golden light!',
        illustrationPrompt: 'A adorable fluffy purple owl peeking warmly at a glowing golden star resting gently on lush green forest moss with colorful fireflies around.',
        imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
        soundEffect: 'sparkle'
      },
      {
        id: 'b3',
        pageNumber: 3,
        text: '"Hello little star!" chirped Barnaby. "Why are you down here?" "I slipped off a cloud while bouncing!" giggled Starry. "Can you help me climb back home?"',
        illustrationPrompt: 'Close up of a friendly cute owl talking to a sparkling friendly golden star with little eyes, magical pixie dust floating in the air.',
        imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
        soundEffect: 'pop'
      },
      {
        id: 'b4',
        pageNumber: 4,
        text: 'Barnaby called his best friends: Sammy the Squirrel brought a woven vine ladder, and Penny the Bunny brought a giant bouncy mushroom launchpad!',
        illustrationPrompt: 'A friendly purple owl, a cheerful squirrel with a leafy vine ladder, and a cute pink rabbit standing around a big golden bouncy mushroom under the starry sky.',
        imageUrl: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=800&q=80',
        soundEffect: 'pop'
      },
      {
        id: 'b5',
        pageNumber: 5,
        text: 'BOING! Starry bounced off the mushroom, flew past the tallest pine tree, and zoomed right back onto his soft blue cloud. "Thank you friends!" sang Starry, lighting up the whole forest!',
        illustrationPrompt: 'A magical night sky filled with bright twinkling stars, a joyful little star waving happily from a fluffy blue cloud while a cute owl flies happily below.',
        imageUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=800&q=80',
        soundEffect: 'success'
      }
    ]
  },
  {
    id: 'pippa-pancake-picnic',
    title: "Pippa's Pancake Picnic",
    author: 'Story Magic',
    ageGroup: '6-8',
    theme: 'Magical Meadow',
    coverColor: 'from-amber-400 via-orange-400 to-rose-400',
    description: 'Pippa the Pixie hosts a grand pancake breakfast for woodland critters, until a friendly baby dragon accidentally turns the syrup into rainbow sparkles!',
    coverImageUrl: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=800&q=80',
    pages: [
      {
        id: 'p1',
        pageNumber: 1,
        text: 'Every Sunday morning, Pippa the Pixie put on her tiny apron and baked the fluffiest golden pancakes in Sunshine Meadow. The sweet vanilla smell tickled every squirrel nose for miles!',
        illustrationPrompt: 'A cheerful tiny pixie fairy with sparkle wings flipping golden pancakes on a small stone griddle in a sunlit flower meadow filled with butterflies.',
        imageUrl: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=800&q=80',
        soundEffect: 'sparkle'
      },
      {
        id: 'p2',
        pageNumber: 2,
        text: 'Animals lined up with red checkered blankets. Barnaby the hamster brought fresh wild blueberries, and Mama Bear brought a big jug of warm maple syrup.',
        illustrationPrompt: 'Cute woodland creatures including a hamster with blueberries and a gentle bear sitting on picnic blankets around a giant stack of pancakes in a sunny meadow.',
        imageUrl: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=800&q=80',
        soundEffect: 'pop'
      },
      {
        id: 'p3',
        pageNumber: 3,
        text: 'Suddenly, ACHOO! A tiny green baby dragon named Ignis sneezed a tiny puff of magical pink fire right onto the syrup bottle! *Whoosh!*',
        illustrationPrompt: 'A tiny cute green baby dragon sneezing a pink glowing puff of magical sparkles onto a bottle of syrup, surrounded by surprised woodland animals.',
        imageUrl: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80',
        soundEffect: 'sparkle'
      },
      {
        id: 'p4',
        pageNumber: 4,
        text: 'The syrup bubbled into a swirling stream of edible rainbow glitter! "Oh my!" gasped Pippa. Ignis hid his face behind his tail, feeling shy.',
        illustrationPrompt: 'A swirling fountain of vibrant rainbow glitter syrup flowing over a tall pancake stack, with a cute baby dragon holding his tail shyly.',
        imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
        soundEffect: 'sparkle'
      },
      {
        id: 'p5',
        pageNumber: 5,
        text: 'Pippa tasted a drop on her pinky finger. "It tastes like strawberry sunshine!" she cheered. Everyone laughed and gobbled up the rainbow pancakes, crowning Ignis the official Magic Chef!',
        illustrationPrompt: 'Woodland creatures happily eating rainbow sparkly pancakes together under a golden sunny rainbow, with a proud smiling baby dragon wearing a tiny chef hat.',
        imageUrl: 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?auto=format&fit=crop&w=800&q=80',
        soundEffect: 'success'
      }
    ]
  },
  {
    id: 'cosmo-space-puppy',
    title: 'Cosmo The Space Puppy',
    author: 'Story Magic',
    ageGroup: '3-5',
    theme: 'Outer Space',
    coverColor: 'from-blue-600 via-teal-500 to-emerald-400',
    description: 'Cosmo straps on his cardboard space helmet and builds a rocket ship in his living room, blasting off to discover the delicious Cheese Moon!',
    coverImageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
    pages: [
      {
        id: 'c1',
        pageNumber: 1,
        text: 'Cosmo was a golden puppy with floppy ears and a nose for big dreams. Today, he placed a shiny aluminum pot on his head: "3... 2... 1... Blastoff to Space!"',
        illustrationPrompt: 'A adorable golden retriever puppy wearing a shiny fun space helmet made from a bowl, sitting inside a colorful cardboard rocket box in a bright bedroom.',
        imageUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80',
        soundEffect: 'pop'
      },
      {
        id: 'c2',
        pageNumber: 2,
        text: 'His cardboard box rocket soared past swirling neon nebulae and dancing shooting stars. Cosmo barked with glee as squeaky-toy asteroids floated by!',
        illustrationPrompt: 'A playful puppy floating happily in a colorful cartoon space galaxy filled with glowing pink and purple planets, star dust, and floating squeaky bone toys.',
        imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
        soundEffect: 'sparkle'
      },
      {
        id: 'c3',
        pageNumber: 3,
        text: 'Ahead lay the Great Cheese Moon! Cosmo made a gentle tail-wag landing on the soft yellow craters. "Woof! It smells like warm cheddar!"',
        illustrationPrompt: 'A golden puppy standing on a cute bright yellow cratered moon in space, wearing a cute space suit, wagging tail with Earth visible in background.',
        imageUrl: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=800&q=80',
        soundEffect: 'pop'
      },
      {
        id: 'c4',
        pageNumber: 4,
        text: 'A friendly alien kitten with three sparkling eyes bounced out from behind a crater. "Welcome to Moon Base Alpha! Want to play cosmic fetch?"',
        illustrationPrompt: 'A cute three-eyed furry space alien kitten playing with a golden puppy on the glowing moon surface with glowing space balls.',
        imageUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=800&q=80',
        soundEffect: 'sparkle'
      },
      {
        id: 'c5',
        pageNumber: 5,
        text: 'After hours of gravity jumps, Cosmo drifted back to his cozy puppy bed, cuddling his space bone and dreaming of his next galaxy trip.',
        illustrationPrompt: 'A cute golden puppy sleeping peacefully under a warm blue blanket in his cozy room with star stickers on the ceiling and a cardboard rocket ship nearby.',
        imageUrl: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=800&q=80',
        soundEffect: 'success'
      }
    ]
  }
];
