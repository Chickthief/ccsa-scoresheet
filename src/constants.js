export let away = {
  name: "Unchained",
  turn: 0,
  score: 0,
  outs: 0,
  players: [
    {
      name: "Marcus Chan",
      number: 42
    },
    {
      name: "Grace Hung",
      number: 2
    },
    {
      name: "Lucas Wong",
      number: 33
    },
    {
      name: "Jeffrey Lou",
      number: 23
    },
    {
      name: "Winnie Huang",
      number: 10
    },
    {
      name: "Justin Chiu",
      number: 77
    },
    {
      name: "Elise Chiu",
      number: 24
    },
    {
      name: "Ethan Chen",
      number: 6
    },
    {
      name: "Ryan Lee",
      number: 15
    },
    {
      name: "Dorcas Ng",
      number: 19
    },
    {
      name: "Lealan Erin Macabiog",
      number: 5
    },
    {
      name: "Darren Ko",
      number: 88
    },
    {
      name: "Janet Leung",
      number: 13
    }
  ]
};
  
export let home = {
  name: "Sack of Rice",
  turn: 0,
  score: 0,
  outs: 0,
  players: [
    {
      name: "Ryan Li",
      number: 15
    }
  ]
};
  
export const gameDetails = {
  code: "TB0908",
  date: "July 24, 2022",
  time: "4:00 pm",
  location: "Parkway Forest"
};

export let currentInning = 0;

export let game = [];
for (let i = 0; i < 16; i++) {
  game[i] = {
    inning: Math.trunc((i/2)+1),
    type: i % 2 === 0 ? "top" : "bottom",
    outs: 0
  }
}