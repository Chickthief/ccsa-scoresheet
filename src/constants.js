export let team1 = {
  name: "Unchained",
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
      name: "Simeon Wong",
      number: 4
    }
  ]
};
  
export let team2 = {
  name: "Sack of Rice",
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