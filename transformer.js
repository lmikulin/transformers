const fs = require('fs');
const defaultFileName = './transformer-data.csv';

const STRENGTH=0,
  INTELLIGENCE=1,
  SPEED=2,
  ENDURANCE=3,
  RANK=4,
  COURAGE=5,
  FIREPOWER=6,
  SKILL=7;

const DECEPTICON = 'D', AUTOBOT= 'A';
const OPTIMUS = 'Optimus Prime', PREDAKING = 'Predaking';

const MAX_COURAGE = 4;
const MAX_STRENGTH = 3;
const MAX_SKILL = 3;

// set the alive flag
function fight(auto, decept) {
  // check for Optimus Prime and Predaking
  if (auto.name === OPTIMUS) {
    if (decept.name === PREDAKING) {
      auto.alive = false;
      decept.alive = false;
      return;
    }
    decept.alive = false;
    return;
  }
  if (decept.name === PREDAKING) {
    auto.alive = false;
    return;
  }

  // courage and strength
  let deltaCourage = auto.stats[COURAGE] - decept.stats[COURAGE];
  let deltaStrength = auto.stats[STRENGTH] - decept.stats[STRENGTH];
  if ((deltaCourage >= MAX_COURAGE) && (deltaStrength >= MAX_STRENGTH)) {
    decept.alive = false;
    return;
  }
  if ((deltaCourage <= -MAX_COURAGE) && (deltaStrength <= -MAX_STRENGTH)) {
    auto.alive = false;
    return;
  }

  // skill
  let deltaSkill = auto.stats[SKILL] - decept.stats[SKILL];
  if (deltaSkill >= MAX_SKILL) {
    decept.alive = false;
    return;
  }
  if (deltaSkill <= -MAX_SKILL) {
    auto.alive = false;
    return;
  }

  // total
  if (auto.total > decept.total) {
    decept.alive = false;
    return;
  }
  if (auto.total < decept.total) {
    auto.alive = false;
    return;
  }
  if (auto.total === decept.total) {
    auto.alive = false;
    decept.alive = false;
    return;
  }
}

// return the number of dead bots
// and a string list of the survivor names
function getTeamSummary(bots) {
  let numDead = 0;
  let survivors = '';
  let separator = ': ';
  bots.forEach(bot => {
    if (bot.alive) {
      survivors += separator + bot.name;
      separator = ', ';
    } else {
      numDead++;
    }
  });
  return {numDead, survivors};
}

// fight bots and console.log results
function battleTeams(teams) {
  let autobots = teams[AUTOBOT];
  let decepticons = teams[DECEPTICON];
  let numBattles = Math.min(autobots.length, decepticons.length);
  for(let round=0; round < numBattles; round++) {
    fight(autobots[round], decepticons[round]);
  }
  console.log(`${numBattles} battle${numBattles > 1 ? 's' : ''}`);
  let summaryA = getTeamSummary(autobots);
  let summaryD = getTeamSummary(decepticons);

  if (summaryA.numDead < summaryD.numDead) {
    console.log('Winning Team (Autobots)' + summaryA.survivors);
    console.log('Survivors from the losing team (Decepticons)' + summaryD.survivors);
  } else if (summaryA.numDead > summaryD.numDead) {
    console.log('Winning Team (Decepticons)' + summaryD.survivors);
    console.log('Survivors from the losing team (Autobots)' + summaryA.survivors);
  } else {
    console.log('Battle tied');
    console.log('Autobots survivors' + summaryA.survivors);
    console.log('Decepticons survivors' + summaryD.survivors);
  }
}

// sort the bots into Autobot and Decepticon teams
// teams are sorted decrementally by rank
function getTeams(bots) {
  // make teams
  let autobots = [];
  let decepticons = [];
  bots.forEach(bot => {
    if (bot.team === DECEPTICON) {
      decepticons.push(bot);
    } else if (bot.team === AUTOBOT) {
      autobots.push(bot);
    }
  });
  autobots.sort((first, second) => second.stats[RANK] - first.stats[RANK]);
  decepticons.sort((first, second) => second.stats[RANK] - first.stats[RANK]);
  let teams = {};
  teams[AUTOBOT] = autobots;
  teams[DECEPTICON] = decepticons;
  return teams;
}

// parse the csv data
// bots are newline separated
// bot values are comma separated
function getTransformers(data) {
  return data.trim().split('\n').map(line => {
    let arr = line.trim().split(',');
    let stats = [];
    for (let index=2; index<=9; index++) {
      stats.push(Number(arr[index]));
    }
    let total = stats[STRENGTH] +
      stats[INTELLIGENCE] +
      stats[SPEED] +
      stats[ENDURANCE] +
      stats[FIREPOWER];
    return {
      name: arr[0].trim(),
      team: arr[1].trim(),
      stats: stats,
      total: total,
      alive: true
    };
  });
}

// if no data file specified fall back to transformer-data.csv
let fileName = process.argv[2] || defaultFileName;
fs.readFile(fileName, 'utf8', (err, data) => {
  if (err) {
    console.log(`error reading file: ${fileName}`);
  } else {
    try {
      let bots = getTransformers(data);
      let teams = getTeams(bots);
      battleTeams(teams);
    } catch (error) {
      console.log(`error parsing file: ${fileName}\n${error.message}`)
    }
  }
});
