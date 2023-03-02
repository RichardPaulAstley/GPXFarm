let team = []

if (localStorage.getItem("team")) {
    team = JSON.parse(localStorage.getItem("team"));
}

let eggData = {
    clicks: 0,
    hatches: 0,
	shinyHatches : 0
}

let balance = {
		pokeDollar: 0
}

let inventory = []

window.addEventListener("load", function() {
if (localStorage.getItem("eggData")) {
eggData = JSON.parse(localStorage.getItem("eggData"));
}
  document.getElementById("eggs-hatched").innerHTML = eggData.hatches || 0;
  document.getElementById("shiny-hatched").innerHTML = eggData.shinyHatches || 0;
  document.getElementById("clicks-done").innerHTML = eggData.clicks || 0;
});

window.addEventListener("load", function() {
if (localStorage.getItem("balance")) {
balance = JSON.parse(localStorage.getItem("balance"));
}
  document.getElementById("currency-amount").innerHTML = balance.pokeDollar.toLocaleString() || 0;
});

if (localStorage.getItem("balance")) {
  balance = JSON.parse(localStorage.getItem("balance"));
}

if (localStorage.getItem("inventory")) {
  inventory = JSON.parse(localStorage.getItem("inventory"));
}

let storageExtensions = 0;
inventory.forEach((item) => {
  if (item.name === "PC Extension") {
    storageExtensions += item.amount;
  }
});

const totalStorage = 300 + (storageExtensions * 30);

let storage = new Array(totalStorage).fill(undefined);

if (localStorage.getItem("storage")) {
    storage = JSON.parse(localStorage.getItem("storage"));
}

function updateSprites() {
  let pokemonData;
  let team = JSON.parse(localStorage.getItem("team")) || [];
  let storage = JSON.parse(localStorage.getItem("storage")) || [];

  team = team.map((member) => {
    pokemonData = pokemonDatabase.find(data => data.name === member.species);
    if (pokemonData && pokemonData.sprite !== member.sprite) {
      member.sprite = pokemonData.sprite;
    }
    return member;
  });

  storage = storage.map((member) => {
    pokemonData = pokemonDatabase.find(data => data.name === member.species);
    if (pokemonData && pokemonData.sprite !== member.sprite) {
      member.sprite = pokemonData.sprite;
    }
    return member;
  });

  localStorage.setItem("team", JSON.stringify(team));
  localStorage.setItem("storage", JSON.stringify(storage));
}