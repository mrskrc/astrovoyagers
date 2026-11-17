/* ASTROVOYAGERS · Story time (the voyager's page)
   Short stories to listen to. Each one has four questions about the story, one reference question
   (what a word like "it" or "they" points to) and one context-clue question (the meaning of a harder
   word, found from the sentences around it). Plain English at A2 level, original texts.
   world: true marks a story with facts about the world (general knowledge).
   q:    [question, answer, wrong, wrong]           the first option is always the answer; the page mixes them
   ref:  [part of the text, the word, answer, wrong, wrong]
   clue: [part of the text, the word, answer, wrong, wrong] */
self.AVStories = [
  // ---------- everyday life and the Star Base ----------
  { id: 'morning', title: 'A Busy Morning',
    text: "Mia gets up at seven o'clock every morning. First, she washes her face and brushes her teeth. Then she has breakfast with her little brother, Tom. Mia is always starving in the morning, so she eats a lot. She has bread, cheese, olives and an egg. She drinks a glass of milk too. At eight o'clock they walk to school together. School is not far, so they don't take the bus. Mia's first lesson today is English. It is her favourite!",
    q: [
      ['What time does Mia get up?', "at seven o'clock", "at eight o'clock", "at nine o'clock"],
      ['Who does Mia have breakfast with?', 'her brother', 'her friend', 'her teacher'],
      ['What does Mia drink?', 'milk', 'tea', 'orange juice'],
      ['How do they go to school?', 'They walk.', 'They take the bus.', 'They go by car.']
    ],
    ref: ["Mia's first lesson today is English. It is her favourite!", 'It', 'English', 'the bus', 'breakfast'],
    clue: ['Mia is always starving in the morning, so she eats a lot.', 'starving', 'very hungry', 'very tired', 'very late'] },
  { id: 'zib', title: "Zib's Shop",
    text: "Zib is a friendly little shopkeeper. He has a shop at the Star Base. In his shop there are hats, capes and parts for spaceships. Zib opens the shop at nine o'clock in the morning and closes it at five in the afternoon. Voyagers come to the shop every day. They always say please and thank you, so Zib thinks they are very polite. Today a girl wants a red hat. It is twenty Star Coins. She has thirty coins, so she can buy it.",
    q: [
      ["Where is Zib's shop?", 'at the Star Base', 'at a school', 'on a farm'],
      ['When does the shop open?', "at nine o'clock", "at five o'clock", "at seven o'clock"],
      ['How much is the red hat?', 'twenty Star Coins', 'thirty Star Coins', 'fifty Star Coins'],
      ['Can the girl buy the hat?', 'Yes, she can.', "No, she can't.", 'The story does not say.']
    ],
    ref: ["Zib opens the shop at nine o'clock in the morning and closes it at five in the afternoon.", 'it', 'the shop', 'the morning', 'the hat'],
    clue: ['They always say please and thank you, so Zib thinks they are very polite.', 'polite', 'kind and nice when they speak', 'rich', 'noisy'] },
  { id: 'friend', title: 'My Best Friend',
    text: "My best friend is Leo. He is eleven years old, and he is in my class. Leo is tall and he has short brown hair. He is hilarious. He tells jokes all day, and everybody laughs. He is also good at maths. I am not good at maths, so he helps me. After school we play basketball in the park. On Saturdays Leo comes to my house and we play computer games there. I am happy because I have a good friend.",
    q: [
      ['How old is Leo?', 'eleven', 'ten', 'twelve'],
      ['What does Leo look like?', 'tall, with short brown hair', 'short, with long hair', 'tall, with blond hair'],
      ['What is Leo good at?', 'maths', 'art', 'music'],
      ['What do they play after school?', 'basketball', 'football', 'tennis']
    ],
    ref: ['On Saturdays Leo comes to my house and we play computer games there.', 'there', "at the writer's house", 'in the park', 'at school'],
    clue: ['He is hilarious. He tells jokes all day, and everybody laughs.', 'hilarious', 'very funny', 'very tall', 'very quiet'] },
  { id: 'trip', title: 'The School Trip',
    text: "Last Friday our class went to the science museum. We went there by bus. In the museum we saw a big model of the Moon and a real space suit. Our teacher took a lot of photos. At twelve o'clock we had lunch in the garden. I ate a sandwich and an apple. After lunch we watched a short film about the planets. It was fascinating, and nobody looked at their phone. It was a great day, and we didn't want to go home.",
    q: [
      ['When did the class go to the museum?', 'last Friday', 'last Monday', 'yesterday'],
      ['How did they go there?', 'by bus', 'by train', 'on foot'],
      ['What did they see in the museum?', 'a model of the Moon', 'a dinosaur', 'old cars'],
      ['Where did they have lunch?', 'in the garden', 'on the bus', 'in the classroom']
    ],
    ref: ['Last Friday our class went to the science museum. We went there by bus.', 'there', 'to the science museum', 'to the garden', 'to school'],
    clue: ['After lunch we watched a short film about the planets. It was fascinating, and nobody looked at their phone.', 'fascinating', 'very interesting', 'very long', 'very boring'] },
  { id: 'rain', title: 'A Rainy Sunday',
    text: "It is Sunday, and it is raining. Ella can't go to the park, so she is at home with her family. Her dad is cooking soup in the kitchen. Her mum is reading a book in the living room. Her sister Lily is drawing a picture of a cat. Ella is not bored. She is making a paper spaceship for her room. Their cat is sleeping on the sofa. The cat hates the rain, so it never goes out on wet days.",
    q: [
      ['What is the weather like?', 'It is raining.', 'It is sunny.', 'It is snowing.'],
      ['Where is Ella?', 'at home', 'in the park', 'at school'],
      ['What is her dad doing?', 'cooking soup', 'reading a book', 'watching TV'],
      ['What is Lily drawing?', 'a cat', 'a spaceship', 'a house']
    ],
    ref: ['Her sister Lily is drawing a picture of a cat. Ella is not bored. She is making a paper spaceship for her room.', 'She', 'Ella', 'Lily', 'the cat'],
    clue: ['The cat hates the rain, so it never goes out on wet days.', 'hates', 'does not like at all', 'likes very much', 'watches'] },
  { id: 'nova', title: "Captain Nova's Day",
    text: "Captain Nova lives on a spaceship. Her day starts at six o'clock. She checks the engines and talks to her crew. There are five people in her crew. In the morning they clean the ship. In the afternoon they study the stars. Captain Nova's favourite planet is Saturn because it has beautiful rings. In the evening the crew eats dinner together and tells funny stories. After a long day everybody is exhausted, so they go to bed early. Tomorrow is another big day in space!",
    q: [
      ['Where does Captain Nova live?', 'on a spaceship', 'in a big city', 'on a farm'],
      ['How many people are there in her crew?', 'five', 'six', 'ten'],
      ['What do they do in the morning?', 'They clean the ship.', 'They study the stars.', 'They eat dinner.'],
      ['What does the crew do in the evening?', 'They eat dinner together.', 'They clean the ship.', 'They check the engines.']
    ],
    ref: ["Captain Nova's favourite planet is Saturn because it has beautiful rings.", 'it', 'Saturn', 'the spaceship', 'the crew'],
    clue: ['After a long day everybody is exhausted, so they go to bed early.', 'exhausted', 'very tired', 'very hungry', 'very happy'] },
  { id: 'market', title: 'At the Market',
    text: "On Saturday morning Sam and his grandma go to the market. They need fruit and vegetables for the week. Grandma buys two kilos of tomatoes, some potatoes and an enormous watermelon. It is ten kilos! Sam carries the bags because they are heavy. He wants strawberries, but there aren't any today. So he chooses bananas. At the end, Grandma buys him an ice cream. Thank you for your help, she says. Sam smiles. He likes going to the market with her.",
    q: [
      ['Who goes to the market with Sam?', 'his grandma', 'his mum', 'his friend'],
      ['When do they go?', 'on Saturday morning', 'on Sunday evening', 'on Friday afternoon'],
      ['Which fruit does Sam choose?', 'bananas', 'strawberries', 'apples'],
      ['What does Grandma buy for Sam at the end?', 'an ice cream', 'a watermelon', 'a toy']
    ],
    ref: ['Sam carries the bags because they are heavy.', 'they', 'the bags', 'Sam and Grandma', 'the tomatoes'],
    clue: ['Grandma buys two kilos of tomatoes, some potatoes and an enormous watermelon. It is ten kilos!', 'enormous', 'very big', 'very sweet', 'very cheap'] },
  { id: 'nora', title: 'The New Student',
    text: "There is a new student in our class. Her name is Nora, and she comes from Spain. She can speak Spanish and English, and she is learning French now. Nora is a little shy. She doesn't talk much, and her face goes red when the teacher asks her a question. But she is very kind. She sits next to me. In the break we talk about our hobbies. She likes swimming and painting. I like them too! Next week we are going to go to the pool together.",
    q: [
      ['Where does Nora come from?', 'Spain', 'Italy', 'France'],
      ['Which language is Nora learning now?', 'French', 'Spanish', 'English'],
      ['Where does Nora sit?', 'next to the writer', 'at the back', 'near the door'],
      ['What are they going to do next week?', 'go to the pool', 'go to the cinema', 'play tennis']
    ],
    ref: ['She likes swimming and painting. I like them too!', 'them', 'swimming and painting', 'Spanish and English', 'the students'],
    clue: ["Nora is a little shy. She doesn't talk much, and her face goes red when the teacher asks her a question.", 'shy', 'quiet and nervous with people', 'loud and funny', 'angry'] },
  { id: 'bolt', title: 'My Pet Robot',
    text: "Ben has a pet, but it is not a cat or a dog. It is a small robot! Its name is Bolt. Bolt is blue and it has two big yellow eyes. It can walk, dance and say hello in three languages. It can't swim, because water is harmful for robots. It can break them. Every evening Ben cleans Bolt with a soft cloth. Bolt sleeps on Ben's desk, next to the lamp. Ben's friends think Bolt is the best pet in the world.",
    q: [
      ["What is Ben's pet?", 'a robot', 'a cat', 'a dog'],
      ['What colour is Bolt?', 'blue', 'yellow', 'red'],
      ['When does Ben clean Bolt?', 'every evening', 'every morning', 'on Sundays'],
      ['Where does Bolt sleep?', "on Ben's desk", 'under the bed', 'in the kitchen']
    ],
    ref: ['Ben has a pet, but it is not a cat or a dog.', 'it', "Ben's pet", 'Ben', 'the dog'],
    clue: ["It can't swim, because water is harmful for robots. It can break them.", 'harmful', 'bad and dangerous', 'cold', 'clean'] },
  { id: 'party', title: 'A Birthday Party',
    text: "Today is Zoe's birthday. She is twelve years old. Her party is in the garden because the weather is sunny. There are balloons on the trees and a big chocolate cake on the table. Eight friends are coming at three o'clock. Zoe's mum is making lemonade, and her dad is putting music on. Zoe's grandparents gave her a new bike this morning. She wants to ride it after the party. She is thrilled. She can't stop smiling!",
    q: [
      ['How old is Zoe today?', 'twelve', 'eleven', 'thirteen'],
      ['Where is the party?', 'in the garden', 'at school', 'in a restaurant'],
      ['How many friends are coming?', 'eight', 'three', 'twelve'],
      ["What is Zoe's mum making?", 'lemonade', 'a cake', 'sandwiches']
    ],
    ref: ["Zoe's grandparents gave her a new bike this morning. She wants to ride it after the party.", 'it', 'the new bike', 'the cake', 'the party'],
    clue: ["She is thrilled. She can't stop smiling!", 'thrilled', 'very happy and excited', 'very tired', 'a little sad'] },
  { id: 'key', title: 'The Lost Key',
    text: "Yesterday Max came home from school at four o'clock. He looked in his bag, but his key wasn't there. He searched his pockets, his lunch box and his pencil case. No key! His parents were at work, so he sat in front of the door and waited. Then his neighbour, Mrs Green, saw him. She invited him to her house and gave him some cookies. At six o'clock his mum came home. The key was in her bag! Max laughed and said thank you to Mrs Green.",
    q: [
      ['What time did Max come home?', "at four o'clock", "at six o'clock", "at five o'clock"],
      ['What was the problem?', "He didn't have his key.", 'He was hungry.', 'He lost his bag.'],
      ['Where were his parents?', 'at work', 'at home', 'at the market'],
      ['Where was the key?', "in his mum's bag", 'in his pocket', 'at school']
    ],
    ref: ['Then his neighbour, Mrs Green, saw him. She invited him to her house and gave him some cookies.', 'She', 'Mrs Green', "Max's mum", 'the teacher'],
    clue: ["He looked in his bag, but his key wasn't there. He searched his pockets, his lunch box and his pencil case. No key!", 'searched', 'looked carefully in', 'washed', 'closed'] },
  { id: 'green', title: 'Planet Green',
    text: "Planet Green is a small planet far from Earth. There are no cities on it, but there are big forests and long rivers. The trees are purple, not green. That is funny, because the planet's name is Green! Tiny animals live in the forests. They are as small as your hand, and they have six legs. They are friendly and they love music. Voyagers can visit Planet Green in spring. In winter it is too cold, and the rivers are ice. Don't forget your camera!",
    q: [
      ['What is there on Planet Green?', 'forests and rivers', 'big cities', 'only sand'],
      ['What colour are the trees?', 'purple', 'green', 'blue'],
      ['How many legs do the animals have?', 'six', 'four', 'eight'],
      ['When can voyagers visit the planet?', 'in spring', 'in winter', 'never']
    ],
    ref: ['Planet Green is a small planet far from Earth. There are no cities on it, but there are big forests and long rivers.', 'it', 'Planet Green', 'Earth', 'a river'],
    clue: ['Tiny animals live in the forests. They are as small as your hand, and they have six legs.', 'Tiny', 'very small', 'very fast', 'very old'] },
  { id: 'match', title: 'The Big Match',
    text: "On Saturday our school team played an important football match. I was the goalkeeper. In the first half the other team scored a goal, and we were sad. Our coach said, Don't give up! In the second half we played much better. Kerem scored in the last minute, so the score was one to one. Then there were penalties. I was nervous. My hands were shaking! But I saved the last penalty, and we won. My friends carried me on their shoulders.",
    q: [
      ['What was the writer in the team?', 'the goalkeeper', 'the coach', 'the captain'],
      ['Who scored in the last minute?', 'Kerem', 'the writer', 'the coach'],
      ['What did the coach say?', "Don't give up!", 'Go home!', 'Play slowly!'],
      ['How did the team win?', 'The writer saved the last penalty.', 'Kerem scored three goals.', 'The other team went home.']
    ],
    ref: ['In the first half the other team scored a goal, and we were sad.', 'we', "the writer's team", 'the other team', 'the coaches'],
    clue: ['I was nervous. My hands were shaking!', 'nervous', 'worried and not calm', 'very happy', 'very strong'] },
  { id: 'pancake', title: 'Pancake Day',
    text: "Last Sunday I wanted to make pancakes for my family. I mixed flour, milk and two eggs in a bowl. But I turned the mixer on too fast, and the mixture flew everywhere! It was on the walls, on the cat and in my hair. My dad came in and laughed. We cleaned everything together. Then he showed me the recipe again, step by step. The second time the pancakes were delicious. Everybody ate three, and nothing was left!",
    q: [
      ['What did the writer want to make?', 'pancakes', 'a cake', 'soup'],
      ['What went wrong?', 'The mixture flew everywhere.', 'The eggs were bad.', 'The pancakes burned.'],
      ['Who helped the writer to clean?', 'Dad', 'Mum', 'a friend'],
      ['How many pancakes did everybody eat?', 'three', 'two', 'ten']
    ],
    ref: ['My dad came in and laughed. We cleaned everything together. Then he showed me the recipe again, step by step.', 'he', 'Dad', 'the cat', 'the writer'],
    clue: ['The second time the pancakes were delicious. Everybody ate three, and nothing was left!', 'delicious', 'very tasty', 'very big', 'very cold'] },
  { id: 'library', title: 'The Quiet Place',
    text: "Our town has a small library next to the park. I go there every Wednesday after school. You can borrow three books for two weeks. You take them home, read them and then bring them back. It is free! The librarian, Mr Hill, knows every book. He always finds a good one for me. Last week he gave me a book about sharks. You must be quiet in the library, so my friends and I only whisper there.",
    q: [
      ['Where is the library?', 'next to the park', 'next to the school', 'in the park'],
      ['When does the writer go there?', 'every Wednesday', 'every weekend', 'every day'],
      ['How many books can you take?', 'three', 'two', 'ten'],
      ["What was last week's book about?", 'sharks', 'robots', 'planets']
    ],
    ref: ['The librarian, Mr Hill, knows every book. He always finds a good one for me.', 'one', 'a book', 'a librarian', 'a friend'],
    clue: ['You can borrow three books for two weeks. You take them home, read them and then bring them back.', 'borrow', 'take and give back later', 'buy', 'write'] },

  // ---------- the world around us (general knowledge) ----------
  { id: 'bees', title: 'The Busy Bees', world: true,
    text: "Honeybees live together in a home called a hive. One hive can have fifty thousand bees! Every bee has a job. Some bees clean the hive, and some look after the babies. Other bees fly from flower to flower and collect nectar, a sweet liquid inside the flowers. They take it to the hive and make honey from it. Bees are important for us too. They help plants make fruit and seeds. No bees, no apples!",
    q: [
      ['What is a hive?', 'a home for bees', 'a kind of flower', 'a sweet food'],
      ['How many bees can live in one hive?', 'fifty thousand', 'five hundred', 'five thousand'],
      ['What do bees make from nectar?', 'honey', 'milk', 'seeds'],
      ['Why are bees important for us?', 'They help plants make fruit.', 'They clean our gardens.', 'They eat flowers.']
    ],
    ref: ['Bees are important for us too. They help plants make fruit and seeds.', 'They', 'bees', 'plants', 'apples'],
    clue: ['Other bees fly from flower to flower and collect nectar, a sweet liquid inside the flowers.', 'nectar', 'a sweet liquid in flowers', 'a baby bee', 'a kind of fruit'] },
  { id: 'moon', title: 'Our Moon', world: true,
    text: "The Moon is our neighbour in space. It goes around the Earth in about twenty-seven days. There is no air on the Moon, so there is no wind and no sound. During the day it is boiling there: more than one hundred degrees! At night it is much colder than ice. In 1969 two astronauts walked on the Moon for the first time. The first one was Neil Armstrong. Their footprints are still there today, because there is no wind or rain.",
    q: [
      ['How long does the Moon take to go around the Earth?', 'about twenty-seven days', 'about seven days', 'one year'],
      ['Why is there no sound on the Moon?', 'There is no air.', 'It is too cold.', 'It is too far.'],
      ['When did people first walk on the Moon?', 'in 1969', 'in 1869', 'in 2009'],
      ['Why are the footprints still there?', 'There is no wind or rain.', 'They are very big.', 'Astronauts clean them.']
    ],
    ref: ['In 1969 two astronauts walked on the Moon for the first time. The first one was Neil Armstrong.', 'one', 'astronaut', 'year', 'Moon'],
    clue: ['During the day it is boiling there: more than one hundred degrees!', 'boiling', 'very hot', 'very dark', 'very windy'] },
  { id: 'octopus', title: 'The Clever Octopus', world: true,
    text: "An octopus is a very unusual sea animal. It has eight arms, three hearts and blue blood! It has no bones, so it can squeeze into very small places, like a bottle. An octopus is clever, too. It can open jars and find its way out of a maze. When an octopus is in danger, it changes colour and hides. Sometimes it shoots black ink into the water. Then the ink hides it, and it swims away fast. Most octopuses live alone on the sea floor.",
    q: [
      ['How many hearts does an octopus have?', 'three', 'one', 'eight'],
      ['Why can an octopus get into small places?', 'It has no bones.', 'It is very small.', 'It has eight arms.'],
      ['What does an octopus do when it is in danger?', 'It changes colour and hides.', 'It jumps out of the water.', 'It calls its friends.'],
      ['Where do most octopuses live?', 'alone on the sea floor', 'in big groups', 'in rivers']
    ],
    ref: ['Sometimes it shoots black ink into the water. Then the ink hides it, and it swims away fast.', 'it', 'the octopus', 'the ink', 'the bottle'],
    clue: ['It has no bones, so it can squeeze into very small places, like a bottle.', 'squeeze', 'push its body into a small space', 'swim very fast', 'eat quickly'] },
  { id: 'water', title: 'The Journey of Water', world: true,
    text: "Water is always travelling. The sun heats the water in seas and lakes. Then the water becomes a gas and rises into the sky. We cannot see it. High in the sky the air is cold, so the gas turns into tiny drops of water. Millions of them make a cloud. When the drops get heavy, they fall as rain or snow. The rain flows into rivers, and the rivers carry it back to the sea. Then the journey starts again.",
    q: [
      ['What heats the water in seas and lakes?', 'the sun', 'the wind', 'the clouds'],
      ['What happens to the gas high in the sky?', 'It turns into tiny drops of water.', 'It becomes snow at once.', 'It goes into space.'],
      ['When do the drops fall?', 'when they get heavy', 'when it is night', 'when the wind stops'],
      ['Where do the rivers carry the water?', 'back to the sea', 'to the sky', 'to the mountains']
    ],
    ref: ['High in the sky the air is cold, so the gas turns into tiny drops of water. Millions of them make a cloud.', 'them', 'drops of water', 'clouds', 'seas'],
    clue: ['Then the water becomes a gas and rises into the sky.', 'rises', 'goes up', 'falls down', 'gets cold'] },
  { id: 'volcano', title: 'Mountains of Fire', world: true,
    text: "A volcano is a mountain with a hole at the top. Deep under the ground, rock is so hot that it melts. It becomes a thick, red liquid. Sometimes this hot liquid rock comes out of the volcano. We say the volcano erupts. The liquid rock is called lava. It flows down the mountain like a slow river of fire and burns everything on its way. When lava gets cold, it becomes hard, black rock. Some islands, like Hawaii, are made of old lava.",
    q: [
      ['What is at the top of a volcano?', 'a hole', 'a lake', 'a forest'],
      ['What is lava?', 'hot liquid rock', 'black smoke', 'hot water'],
      ['What happens when lava gets cold?', 'It becomes hard, black rock.', 'It becomes water.', 'It goes back into the ground.'],
      ['What are some islands made of?', 'old lava', 'sand', 'ice']
    ],
    ref: ['Deep under the ground, rock is so hot that it melts. It becomes a thick, red liquid.', 'It', 'the hot rock', 'the ground', 'the mountain'],
    clue: ['Sometimes this hot liquid rock comes out of the volcano. We say the volcano erupts.', 'erupts', 'throws out hot liquid rock', 'gets very cold', 'becomes smaller'] },
  { id: 'penguin', title: 'Emperor Penguins', world: true,
    text: "Emperor penguins live in Antarctica, the coldest place on Earth. They are birds, but they cannot fly. They are excellent swimmers and they catch fish in the icy sea. In winter the mother lays one egg and goes to the sea to find food. The father keeps the egg warm on his feet for two months. He doesn't eat anything in that time! When it is very windy, thousands of penguins huddle. They stand very close together, so they all stay warm.",
    q: [
      ['Where do emperor penguins live?', 'in Antarctica', 'at the North Pole', 'in Australia'],
      ["What can't these birds do?", 'fly', 'swim', 'walk'],
      ['Who keeps the egg warm?', 'the father', 'the mother', 'the baby'],
      ['How long does the father keep the egg warm?', 'for two months', 'for two days', 'for two years']
    ],
    ref: ["The father keeps the egg warm on his feet for two months. He doesn't eat anything in that time!", 'He', 'the father penguin', 'the baby penguin', 'the fish'],
    clue: ['When it is very windy, thousands of penguins huddle. They stand very close together, so they all stay warm.', 'huddle', 'stand very close together', 'swim very fast', 'look for food'] },
  { id: 'olympics', title: 'The Olympic Games', world: true,
    text: "The first Olympic Games were in Greece, about 2,800 years ago. There was only one race, and the winner got a crown of olive leaves, not a medal. The modern Games began in Athens in 1896. Today athletes from more than two hundred countries compete in the Games every four years. They try to win gold, silver or bronze medals. The five rings on the Olympic flag are blue, yellow, black, green and red. They show the friendship of the five parts of the world.",
    q: [
      ['Where were the first Olympic Games?', 'in Greece', 'in Italy', 'in Egypt'],
      ['What did the winner get in the first Games?', 'a crown of olive leaves', 'a gold medal', 'a horse'],
      ['How often are the Games today?', 'every four years', 'every year', 'every ten years'],
      ['How many rings are there on the Olympic flag?', 'five', 'four', 'six']
    ],
    ref: ['The five rings on the Olympic flag are blue, yellow, black, green and red. They show the friendship of the five parts of the world.', 'They', 'the five rings', 'the athletes', 'the medals'],
    clue: ['Today athletes from more than two hundred countries compete in the Games every four years. They try to win gold, silver or bronze medals.', 'compete', 'try to win against others', 'watch on TV', 'travel together'] },
  { id: 'leonardo', title: "Leonardo's Notebooks", world: true,
    text: "Leonardo da Vinci lived in Italy about five hundred years ago. He painted the Mona Lisa, one of the most famous paintings in the world. But Leonardo was not only a painter. He was curious about everything. He asked questions all the time: How do birds fly? Why is the sky blue? He wrote his ideas in notebooks and drew machines in them. Some looked like a helicopter and a parachute! He wrote from right to left, so people needed a mirror to read his notes.",
    q: [
      ['Where did Leonardo live?', 'in Italy', 'in Greece', 'in Egypt'],
      ['What is the Mona Lisa?', 'a famous painting', 'a notebook', 'a machine'],
      ['What did Leonardo draw in his notebooks?', 'machines', 'maps of Italy', 'only birds'],
      ['Why did people need a mirror to read his notes?', 'He wrote from right to left.', 'His notes were very small.', 'He wrote in the dark.']
    ],
    ref: ['He wrote his ideas in notebooks and drew machines in them.', 'them', 'the notebooks', 'the machines', 'the birds'],
    clue: ['He was curious about everything. He asked questions all the time: How do birds fly? Why is the sky blue?', 'curious', 'wanting to learn and know things', 'afraid of new things', 'good at sport'] },
  { id: 'recycle', title: "A Bottle's Second Life", world: true,
    text: "Every day we throw away a lot of rubbish: bottles, cans, paper and boxes. But much of it is not really rubbish. We can recycle it. That means we can make new things from old things. An old glass bottle can become a new bottle again and again. Old paper becomes new notebooks. Plastic bottles can even become T-shirts! Recycling saves trees, water and energy. So don't put everything in the same bin. Put glass, paper and plastic in different bins.",
    q: [
      ['What can an old glass bottle become?', 'a new bottle', 'a T-shirt', 'a notebook'],
      ['What can plastic bottles become?', 'T-shirts', 'trees', 'glass'],
      ['What does recycling save?', 'trees, water and energy', 'only money', 'bottles and cans'],
      ['What should we do with glass, paper and plastic?', 'put them in different bins', 'put them in the same bin', 'throw them into the sea']
    ],
    ref: ['Every day we throw away a lot of rubbish: bottles, cans, paper and boxes. But much of it is not really rubbish.', 'it', 'our rubbish', 'the day', 'a bin'],
    clue: ['We can recycle it. That means we can make new things from old things.', 'recycle', 'make new things from old things', 'buy new things', 'clean the house'] },
  { id: 'heart', title: 'Your Amazing Heart', world: true,
    text: "Put your hand on your chest. Can you feel it? That is your heart. It is a muscle, and it is about the size of your fist. Your heart pumps blood to every part of your body. It pushes the blood through long, thin tubes. Your heart never rests, even when you are asleep. A child's heart beats about ninety times a minute. When you run, it beats faster, because your body needs more oxygen. Sport, good food and sleep keep your heart strong.",
    q: [
      ['How big is your heart?', 'about the size of your fist', 'about the size of your head', 'as small as an eye'],
      ['What does the heart send to every part of the body?', 'blood', 'air', 'food'],
      ['When does the heart rest?', 'never', 'at night', 'after sport'],
      ['What happens to your heart when you run?', 'It beats faster.', 'It beats more slowly.', 'It gets smaller.']
    ],
    ref: ["A child's heart beats about ninety times a minute. When you run, it beats faster, because your body needs more oxygen.", 'it', 'your heart', 'your body', 'the minute'],
    clue: ['Your heart pumps blood to every part of your body. It pushes the blood through long, thin tubes.', 'pumps', 'pushes', 'cleans', 'eats'] },
  { id: 'dinosaurs', title: 'When Dinosaurs Lived', world: true,
    text: "Dinosaurs lived on Earth millions of years ago, long before people. Some were as small as a chicken, but others were very big. One of them, Argentinosaurus, was as long as three buses! Many dinosaurs ate only plants. Others, like Tyrannosaurus rex, ate meat. Dinosaurs laid eggs, like birds do today. About sixty-six million years ago the big dinosaurs became extinct: they all died. But scientists still find their bones in rocks and learn about them.",
    q: [
      ['When did dinosaurs live?', 'millions of years ago', 'a hundred years ago', 'two thousand years ago'],
      ['How long was Argentinosaurus?', 'as long as three buses', 'as long as a car', 'as long as a chicken'],
      ['What did Tyrannosaurus rex eat?', 'meat', 'plants', 'fruit'],
      ['Where do scientists find dinosaur bones?', 'in rocks', 'in trees', 'in the sea']
    ],
    ref: ['But scientists still find their bones in rocks and learn about them.', 'them', 'the dinosaurs', 'the scientists', 'the buses'],
    clue: ['About sixty-six million years ago the big dinosaurs became extinct: they all died.', 'extinct', 'not living on Earth any more', 'very hungry', 'very big'] },
  { id: 'camel', title: 'The Ship of the Desert', world: true,
    text: "Camels live in hot, dry deserts. People call the camel the ship of the desert, because it carries people and heavy things across the sand. A camel can walk for a week without water. Then it can drink one hundred litres in ten minutes! The hump on its back is not full of water. It is full of fat, and the camel uses the fat as food on long journeys. Its long eyelashes protect its eyes. They keep the sand out when the wind blows.",
    q: [
      ['Where do camels live?', 'in deserts', 'in forests', 'in cold places'],
      ['Why do people call the camel the ship of the desert?', 'It carries people and things across the sand.', 'It can swim.', 'It is very big.'],
      ["What is in a camel's hump?", 'fat', 'water', 'milk'],
      ['How much water can a camel drink in ten minutes?', 'one hundred litres', 'ten litres', 'one litre']
    ],
    ref: ['The hump on its back is not full of water. It is full of fat, and the camel uses the fat as food on long journeys.', 'It', 'the hump', 'the camel', 'the water'],
    clue: ['Its long eyelashes protect its eyes. They keep the sand out when the wind blows.', 'protect', 'keep safe', 'close', 'clean'] },
  { id: 'amazon', title: 'The Amazon Rainforest', world: true,
    text: "The Amazon is the biggest rainforest in the world. It is in South America. It rains almost every day there, so the forest is always damp. Everything is a little wet: the leaves, the ground and the air. The trees are very tall, and their leaves make a roof over the forest. Under it, the ground is dark. Thousands of kinds of animals live in the Amazon: colourful parrots, monkeys, frogs and big snakes. Rainforests are important because their trees make oxygen.",
    q: [
      ['Where is the Amazon rainforest?', 'in South America', 'in Africa', 'in Asia'],
      ['How often does it rain there?', 'almost every day', 'once a month', 'only in winter'],
      ['Why is the ground dark?', 'The leaves make a roof over the forest.', 'It is always night.', 'The trees are black.'],
      ['Why are rainforests important?', 'Their trees make oxygen.', 'They are very old.', 'They are near the sea.']
    ],
    ref: ['The trees are very tall, and their leaves make a roof over the forest. Under it, the ground is dark.', 'it', 'the roof of leaves', 'the ground', 'the rain'],
    clue: ['It rains almost every day there, so the forest is always damp. Everything is a little wet: the leaves, the ground and the air.', 'damp', 'a little wet', 'very dark', 'very tall'] },
  { id: 'chocolate', title: 'Where Chocolate Comes From', world: true,
    text: "Do you like chocolate? It comes from a tree! The cacao tree grows in hot countries, like Ghana and Brazil. Its fruit is big, and there are about forty seeds inside it. Farmers dry the seeds in the sun for a week. Then factories roast and crush them and make a dark paste. This paste is very bitter. It is not sweet at all! So people add sugar and milk to it. Now it is the chocolate we love.",
    q: [
      ['Where does the cacao tree grow?', 'in hot countries', 'in cold countries', 'in the sea'],
      ['How many seeds are there in the fruit?', 'about forty', 'about four', 'about four hundred'],
      ['How do farmers dry the seeds?', 'in the sun', 'in a factory', 'in the fridge'],
      ['What do people add to the paste?', 'sugar and milk', 'salt and water', 'fruit and nuts']
    ],
    ref: ['Farmers dry the seeds in the sun for a week. Then factories roast and crush them and make a dark paste.', 'them', 'the seeds', 'the farmers', 'the factories'],
    clue: ['This paste is very bitter. It is not sweet at all!', 'bitter', 'with a strong taste, not sweet', 'cold', 'soft'] },
  { id: 'station', title: 'A Home in Space', world: true,
    text: "The International Space Station is a big laboratory in space. About seven astronauts live there at a time. It flies around the Earth sixteen times a day, so the astronauts see sixteen sunrises every day! In the station nothing has weight, so everything floats: people, pens and even drops of water. The astronauts sleep in sleeping bags on the wall. They exercise for two hours every day, because their muscles get weak in space. They also do science experiments.",
    q: [
      ['How many times a day does the station fly around the Earth?', 'sixteen', 'six', 'sixty'],
      ['Where do the astronauts sleep?', 'in sleeping bags on the wall', 'in big beds', 'on the floor'],
      ['How long do they exercise every day?', 'for two hours', 'for ten minutes', 'for six hours'],
      ['Why do they exercise?', 'Their muscles get weak in space.', 'They are bored.', 'They want to win medals.']
    ],
    ref: ['The International Space Station is a big laboratory in space. About seven astronauts live there at a time.', 'there', 'on the space station', 'on the Moon', 'on the Earth'],
    clue: ['In the station nothing has weight, so everything floats: people, pens and even drops of water.', 'floats', 'stays in the air and does not fall', 'breaks', 'gets hot'] },
  { id: 'sleep', title: 'Why Do We Sleep?', world: true,
    text: "We sleep for about one third of our lives. Is it a waste of time? No! Sleep is essential. We cannot live without it. When you sleep, your body rests and grows, and your brain puts the day's lessons in order. So you remember them better the next day. Children of your age need nine to eleven hours of sleep every night. Screens are bad before bedtime, because their light tells your brain that it is still daytime. A book is better!",
    q: [
      ['How much of our lives do we sleep?', 'about one third', 'about half', 'about one tenth'],
      ['What does your brain do when you sleep?', "It puts the day's lessons in order.", 'It stops working.', 'It forgets everything.'],
      ['How many hours of sleep do children need?', 'nine to eleven', 'five to six', 'fourteen to sixteen'],
      ['Why are screens bad before bedtime?', 'Their light tells your brain it is daytime.', 'They are too loud.', 'They are boring.']
    ],
    ref: ["When you sleep, your body rests and grows, and your brain puts the day's lessons in order. So you remember them better the next day.", 'them', "the day's lessons", 'your dreams', 'the hours'],
    clue: ['Sleep is essential. We cannot live without it.', 'essential', 'very important and necessary', 'very easy', 'very long'] },
  { id: 'leaves', title: 'Why Leaves Change Colour', world: true,
    text: "In spring and summer, leaves are green. They are green because of chlorophyll, a green material inside them. Leaves use it and sunlight to make food for the tree. In autumn the days get shorter and colder. There is less sunlight, so the tree stops making chlorophyll. The green colour slowly vanishes, and we can see the other colours in the leaves: yellow, orange and red. Then the leaves fall, and the tree rests in winter. In spring, new green leaves grow again.",
    q: [
      ['Why are leaves green?', 'because of chlorophyll', 'because of the rain', 'because of the cold'],
      ['What do leaves make for the tree?', 'food', 'water', 'seeds'],
      ['What happens to the days in autumn?', 'They get shorter and colder.', 'They get longer.', 'They get hotter.'],
      ['When do new leaves grow?', 'in spring', 'in autumn', 'in winter']
    ],
    ref: ['They are green because of chlorophyll, a green material inside them. Leaves use it and sunlight to make food for the tree.', 'it', 'chlorophyll', 'the tree', 'the summer'],
    clue: ['The green colour slowly vanishes, and we can see the other colours in the leaves: yellow, orange and red.', 'vanishes', 'goes away', 'gets darker', 'comes back'] },
  { id: 'pyramid', title: 'The Great Pyramid', world: true,
    text: "The Great Pyramid of Giza is in Egypt, near the River Nile. It is about 4,500 years old. Workers built it for a king called Khufu. It was his tomb, the place for his body after he died. The pyramid is made of more than two million heavy stone blocks. There were no machines then, so thousands of workers pulled the blocks with ropes. It took about twenty years! For almost four thousand years it was the tallest building in the world.",
    q: [
      ['Where is the Great Pyramid?', 'in Egypt', 'in Greece', 'in Mexico'],
      ['Who was Khufu?', 'a king', 'a worker', 'a river'],
      ['How did the workers move the blocks?', 'They pulled them with ropes.', 'They used big machines.', 'They rolled them down a hill.'],
      ['How long did it take to build the pyramid?', 'about twenty years', 'about two years', 'about two hundred years']
    ],
    ref: ['The Great Pyramid of Giza is in Egypt, near the River Nile. It is about 4,500 years old.', 'It', 'the Great Pyramid', 'the River Nile', 'Egypt'],
    clue: ['It was his tomb, the place for his body after he died.', 'tomb', "a place for a dead person's body", 'a big house for parties', 'a kind of boat'] },
  { id: 'gobeklitepe', title: 'A Very Old Mystery', world: true,
    text: "Göbeklitepe is on a hill near Şanlıurfa in Türkiye. It is about twelve thousand years old. That is much older than the pyramids in Egypt! People built it with huge stone pillars in the shape of the letter T. Some pillars are five metres tall. There are carvings of animals on them: foxes, snakes, birds and wild pigs. The people of that time had no metal tools and no wheels. Nobody knows exactly how they moved the stones. It is still a mystery.",
    q: [
      ['Where is Göbeklitepe?', 'near Şanlıurfa', 'near Istanbul', 'in Egypt'],
      ['How old is it?', 'about twelve thousand years', 'about two thousand years', 'about five hundred years'],
      ['What shape are the pillars?', 'like the letter T', 'like the letter O', 'like a star'],
      ['What is on the pillars?', 'carvings of animals', 'old letters', 'paintings of kings']
    ],
    ref: ['Some pillars are five metres tall. There are carvings of animals on them: foxes, snakes, birds and wild pigs.', 'them', 'the pillars', 'the animals', 'the pyramids'],
    clue: ['Nobody knows exactly how they moved the stones. It is still a mystery.', 'mystery', 'something that nobody can explain', 'a very old stone', 'a kind of tool'] },
  { id: 'cappadocia', title: 'The Fairy Chimneys', world: true,
    text: "Cappadocia is in the middle of Türkiye. It is famous for its strange rocks. People call them fairy chimneys. Millions of years ago volcanoes covered the land with ash. The ash became soft rock. Then wind and rain slowly shaped the rock for a very long time. Long ago people carved houses, churches and even underground cities into the soft rock. Today visitors come from all over the world. Every morning more than a hundred colourful hot-air balloons fly over the valleys.",
    q: [
      ['Where is Cappadocia?', 'in the middle of Türkiye', 'by the sea', 'in the north of Italy'],
      ['What covered the land millions of years ago?', 'ash from volcanoes', 'snow and ice', 'sea water'],
      ['What shaped the rocks?', 'wind and rain', 'people with tools', 'big animals'],
      ['What flies over the valleys every morning?', 'hot-air balloons', 'planes', 'kites']
    ],
    ref: ['It is famous for its strange rocks. People call them fairy chimneys.', 'them', 'the strange rocks', 'the people', 'the volcanoes'],
    clue: ['Long ago people carved houses, churches and even underground cities into the soft rock.', 'carved', 'made by cutting into the rock', 'painted on the rock', 'found under the rock'] },
  { id: 'istanbul', title: 'A City on Two Continents', world: true,
    text: "Istanbul is the biggest city in Türkiye. About sixteen million people live there. It is a special city, because it is on two continents: Europe and Asia. A narrow sea, the Bosphorus, separates them. Three bridges and two tunnels connect the two sides, and ferries cross the water all day. Many people live on one continent and work on the other! Istanbul is also very old. People have lived there for thousands of years, and it was the capital of three great empires.",
    q: [
      ['How many people live in Istanbul?', 'about sixteen million', 'about six million', 'about sixty million'],
      ['Which two continents is Istanbul on?', 'Europe and Asia', 'Europe and Africa', 'Asia and Africa'],
      ['What is the Bosphorus?', 'a narrow sea', 'a big bridge', 'an old palace'],
      ['How many bridges cross the Bosphorus?', 'three', 'two', 'five']
    ],
    ref: ['It is a special city, because it is on two continents: Europe and Asia. A narrow sea, the Bosphorus, separates them.', 'them', 'Europe and Asia', 'the bridges', 'the people'],
    clue: ['Three bridges and two tunnels connect the two sides, and ferries cross the water all day.', 'connect', 'join together', 'close', 'clean'] }
];
