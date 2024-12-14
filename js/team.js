function cleanUpTeamArray() {
  function removeNulls(array) {
    let newArray = [];
    for (let i = 0; i < array.length; i++) {
      if (array[i]) {
        newArray.push(array[i]);
      }
    }
    return newArray;
  }

  function reorderTeamArray() {
    for (let i = 0; i < team.length; i++) {
      if (!team[i]) {
        for (let j = i + 1; j < team.length; j++) {
          if (team[j]) {
            team[i] = team[j];
            team[j] = null;
            break;
          }
        }
      }
    }
    team = removeNulls(team);
  }

  // Check if the team array contains null values
  if (team.includes(null)) {
    // If null values exist, remove them and reorder the array
    team = removeNulls(team);
    reorderTeamArray();
    // Save the updated team array in local storage
    localStorage.setItem('team', JSON.stringify(team));
    location.reload();
  }
}

window.addEventListener('load', cleanUpTeamArray);

function generateToken() {
  let tokenType = null;
  for (let i = 0; i < tokenDatabase.length; i++) {
    const token = tokenDatabase[i];
    if (Math.random() <= 1 / token.count) {
      tokenType = token.type;
      break;
    }
  }

  if (!tokenType) {
    return;
  }

  const existingToken = tokenInventory.find(token => token.type === tokenType);
  if (existingToken) {
    existingToken.amount++;
  } else {
    const token = {
      type: tokenType,
      amount: 1
    };
    tokenInventory.push(token);
  }

  localStorage.setItem("tokenInventory", JSON.stringify(tokenInventory));

  //window.alert(`You got a ${tokenType} token!`);
}

const teamBoxes = document.querySelectorAll('.team-box');

teamBoxes.forEach((teamBox, index) => {

  // Get the current team member
  const currentTeamMember = team[index];
  if (currentTeamMember == null) {
    return;
  }

  // Update the pokemon-sprite element
  const sprite = teamBox.querySelector('.pokemon-sprite img');
  sprite.src = `../` + currentTeamMember.sprite;


  // Function used to use the 'display_name' value for forms in case.
  function getDisplayName(species) {
    let pokemonData = pokemonDatabase.find(p => p.name === species);
    if (pokemonData.display_name) {
      return pokemonData.display_name;
    } else {
      return species;
    }
  }

  // Update the pokemon-name element
  const name = teamBox.querySelector('.pokemon-name');
if (currentTeamMember.isEgg) {
    name.innerText = "Egg";
} else {
    const displayName = getDisplayName(currentTeamMember.species);
    const shinyIcon = currentTeamMember.isShiny
        ? (currentTeamMember.isSC ? '<img src="../sprites/shiny_sc.png" alt="Shiny via Shiny Charm"> ' : '<img src="../sprites/shiny.png" alt="Shiny"> ')
        : '';

    name.innerHTML = shinyIcon + displayName + " " + (currentTeamMember.gender === "Male" ? "♂" : currentTeamMember.gender === "Female" ? "♀" : "(-)");
}

  // Add shiny class if the Pokémon is shiny
  if (currentTeamMember.isShiny && currentTeamMember.isEgg === false) {
    teamBox.classList.add('shiny');
  } else {
    teamBox.classList.remove('shiny');
  }

  // Update the pokemon-level element
  const level = teamBox.querySelector('.pokemon-level');
  if (currentTeamMember.isEgg) {
    for (let i = 0; i < pokemonDatabase.length; i++) {
      if (currentTeamMember.species === pokemonDatabase[i].name) {
        let eggSteps = currentTeamMember.eggSteps + " / " + pokemonDatabase[i].egg_steps;
        level.innerText = eggSteps
        break;
      }
    }
  } else {
    level.innerText = "Lvl. " + currentTeamMember.level /* + " (" + currentTeamMember.experience + " XP)"; */
  }
});

window.onload = function () {
  const hatchButtons = document.getElementsByClassName("hatching-button");
  if (!hatchButtons.length) return;

  for (let i = 0; i < hatchButtons.length; i++) {
    hatchButtons[i].addEventListener("click", function (event) {
      const index = parseInt(event.target.getAttribute("data-index"));
      hatchEgg(team, index);
    });
  }

  let hasHatchableEggs = 0; 
for (let i = 0; i < team.length; i++) {
  if (team[i].isEgg) {
    for (let j = 0; j < pokemonDatabase.length; j++) {
      if (team[i].species === pokemonDatabase[j].name) {
        if (team[i].eggSteps >= pokemonDatabase[j].egg_steps) {
          document.getElementsByClassName("hatching-button")[i].style.display = "block";
          document.getElementsByClassName("hatching-button")[i].setAttribute("data-index", i);
          team[i].eggSteps = pokemonDatabase[j].egg_steps;
          localStorage.setItem("team", JSON.stringify(team));
          hasHatchableEggs++; // Increment it here
        }
        break;
      }
    }
  }
}

  //Check to move this function inside the hatchEgg one.
  function updateUI(idx) {
    let currentPokemon = team[idx];
    const pokemonData = pokemonDatabase.find(p => p.name === currentPokemon.species);
    let displayName = pokemonData.name;
    if (pokemonData.display_name) {
      displayName = pokemonData.display_name;
    }

    document.querySelector(`.team-box:nth-child(${idx + 1}) .pokemon-name`).innerHTML = currentPokemon.isShiny
    ? (currentPokemon.isSC ? '<img src="../sprites/shiny_sc.png" alt="Shiny via Shiny Charm"> ' : '<img src="../sprites/shiny.png" alt="Shiny"> ') + displayName
    : displayName;
    document.querySelector(`.team-box:nth-child(${idx + 1}) .pokemon-gender`).innerHTML = currentPokemon.gender === "Male"
      ? "♂"
        : currentPokemon.gender === "Female"
        ? "♀"
        : "-";
    document.querySelector(`.team-box:nth-child(${idx + 1}) .pokemon-level`).innerHTML = 'Lvl.' + currentPokemon.level;
    document.querySelector(`.team-box:nth-child(${idx + 1}) .hatching-button`).style.display = 'none';
  }

  function saveTeam() {
    localStorage.setItem("team", JSON.stringify(team));
  }

// Function to toggle the lock status of a Pokémon
function toggleLock(pokemon) {
  if (pokemon.isEgg === false) {
    if (!pokemon.isLocked) {
      const lockConfirmation = window.confirm("Do you want to lock this Pokémon?");
      if (lockConfirmation) {
        pokemon.isLocked = true;
        saveTeam();
        alert("Pokémon locked!");
      }
    } else {
      const unlockConfirmation = window.confirm("Do you want to unlock this Pokémon?");
      if (unlockConfirmation) {
        delete pokemon.isLocked;
        saveTeam();
        alert("Pokémon unlocked!");
      }
    }
  }
}

// Add event listeners to the Pokémon sprite images
const spriteElements = document.querySelectorAll('.pokemon-sprite img');
spriteElements.forEach((sprite, index) => {
  sprite.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    const pokemon = team[index];
    if (!pokemon) return;

    toggleLock(pokemon);
  });
});

  // Function to get the "prngValue" from local storage

function hatchEgg(team, index) {
    const prngValue = getPrngValue();

	let shinyCharm = inventory.find(item => item.name === "Shiny Charm");
	let shinyCharmCount = shinyCharm ? shinyCharm.amount : 0;

    if (!team[index]) return;
    let egg = team[index];
    egg.isEgg = false;
    egg.eggSteps = 0;
    egg.level = 1;
    // Check if the egg's shiny value or shiny charm amount determines its shiny status
	if (egg.isShiny === 0) {
		egg.isShiny = true;
		} else {
	let possibleValues = [0];
    for (let i = 1; i <= shinyCharmCount; i++) {
        possibleValues.push(i);
    }

    if (possibleValues.includes(egg.isShiny)) {
      egg.isShiny = true;
      egg.isSC = true;
    }  else {
      egg.isShiny = false;
    }
}

    let pokemon = pokemonDatabase.find(p => p.name === egg.species);
    if (pokemon.gender_rate !== "-") {
      egg.gender = Math.random() * 100 < pokemon.gender_rate ? "Male" : "Female";
    } else {
      egg.gender = "-";
    }
    if (egg.species === "Unown") {
      let form = Math.floor(Math.random() * 28) + 1;
      let spritePath = egg.isShiny ? "./sprites/pokemon/shiny/" : "./sprites/pokemon/";
      egg.sprite = spritePath + `201.${form}.png`;
    } else {
      egg.sprite = egg.isShiny ? pokemon.shiny_sprite : pokemon.sprite;
    }
    if (egg.gender === "Female") {
      let femaleSprite = pokemon.female_sprite;
      if (egg.isShiny && pokemon.female_shiny_sprite) {
        femaleSprite = pokemon.female_shiny_sprite
      }
      if (femaleSprite) {
        egg.sprite = femaleSprite;
      }
    }

    let teamBox = document.querySelector(`.team-box:nth-child(${index + 1})`);
    if (teamBox) {
      teamBox.classList.toggle('shiny', egg.isShiny);

      let spriteElement = teamBox.querySelector('.pokemon-sprite img');
      if (spriteElement) {
        spriteElement.src = `../` + egg.sprite;
      }
    }

  let eggData = JSON.parse(localStorage.getItem("eggData")) || {};
    const currentDate = new Date().toDateString();
    if (eggData.lastUpdate !== currentDate) {
        eggData.dailyHatch = 0; // Réinitialiser le compteur quotidien
        eggData.lastUpdate = currentDate; // Mettre à jour la date
    }
    eggData.hatches = (eggData.hatches || 0) + 1;
    eggData.dailyHatch = (eggData.dailyHatch || 0) + 1;;
    if (egg.isShiny) {
      eggData.shinyHatches = (eggData.shinyHatches || 0) + 1;
      setTimeout(() => {
        window.alert("Congrats! You hatched a Sh. " + pokemon.name + "!");
      }, 500);
    }
    egg.totalHatched = eggData.hatches;
    egg.timeHatched = new Date();
    reRollPrngValue();
    let eggStepsRoll = pokemon.eggSteps;
    // Trigger generateToken() multiple times based on egg steps
    if (eggStepsRoll <= 9000) {
      generateToken();
    } else if (eggStepsRoll <= 20000) {
      generateToken();
      generateToken();
      generateToken();
    } else {
      generateToken();
      generateToken();
      generateToken();
      generateToken();
      generateToken();
    }
    localStorage.setItem("eggData", JSON.stringify(eggData));
    updateUI(index);
    saveTeam();
    updateEggsReadyToHatch();
  }

  const hatchAllButton = document.getElementById("hatch-all-button");
  if (hatchAllButton) {
    if (hasHatchableEggs > 1) {
      hatchAllButton.style.display = "block";
      hatchAllButton.addEventListener("click", function () {
        for (let i = 0; i < team.length; i++) {
          if (team[i].isEgg && team[i].eggSteps >= pokemonDatabase.find(p => p.name === team[i].species).egg_steps) {
            hatchEgg(team, i);
            hatchAllButton.style.display = "none";
          }
        }
      });
    } else {
      hatchAllButton.style.display = "none";
    }
  }
};

// Evolution 

const teamContainer = document.querySelector('.team-container');

for (let i = 0; i < team.length; i++) {
  const pokemon = team[i];

  // Check if the parent element of the button is the team container
  if (teamContainer) {
    let evolvingButton = document.createElement('button');
    evolvingButton.classList.add('evolving-button');
    evolvingButton.style.display = 'none';
    evolvingButton.setAttribute('data-index', i + 1);
    evolvingButton.innerHTML = 'Evolve';
    teamContainer.appendChild(evolvingButton);
  }

  checkEvolutionConditions(pokemon, i, inventory);
}

function checkEvolutionConditions(pokemon, index, inventory) {
  let pokemonData = pokemonDatabase.find(p => p.name === pokemon.species);

  if (!pokemon.isEgg && pokemonData.evolutions && pokemonData.evolutions.length && !pokemon.isLocked) {
    const evolvingButtons = document.querySelectorAll('.evolving-button');
    for (let evolution of pokemonData.evolutions) {
      let meetsConditions = true;
      // Check all conditions for evolution
      for (let i = 0; i < evolution.method.length; i++) {
        let method = evolution.method[i];
        let value = evolution.value;
        if (i === 1 && evolution.value_2) {
          value = evolution.value_2;
        } else if (i > 1) {
          break; // Only support value and value_2 for now
        }
        if (method === 'level') {
          if (pokemon.level < value) {
            meetsConditions = false;
            break;
          }
        }
        if (method === 'item') {
          let item = inventory.find(i => i.name === evolution.value);
          if (!item || item.amount === 0) {
            meetsConditions = false;
            break;
          }
        }
        if (method === 'gender') {
          if (pokemon.gender !== value) {
            meetsConditions = false;
            break;
          }
        }
      }
      if (meetsConditions) {
        for (let j = 0; j < evolvingButtons.length; j++) {
          if (evolvingButtons[j].getAttribute('data-index') === (index + 1).toString()) {
            evolvingButtons[j].style.display = 'block';
            break;
          }
        }
      }
    }
  }
}

const evolvingButton = document.querySelectorAll('.evolving-button');

evolvingButton.forEach(button => {
  button.addEventListener('click', function () {
    // Get the index of the pokemon from the data-index attribute of the button
    let index = this.getAttribute('data-index') - 1;
    let pokemon = team[index];
    let pokemonData = pokemonDatabase.find(p => p.name === pokemon.species);

    // Prompt the user to confirm before evolving the pokemon
    let confirmMessage = `Are you sure you want to evolve ${pokemon.species}?`;
    if (!confirm(confirmMessage)) {
      return;
    }

    // Check if the pokemon has evolutions
    if (pokemonData.evolutions && pokemonData.evolutions.length) {
      // Check if there is more than one evolution available
      if (pokemonData.evolutions.length > 1) {
        // Create a list of available evolutions
        let availableEvolutions = [];
        for (let evolution of pokemonData.evolutions) {
          let meetsConditions = true;
          // Check if the first evolution method is level
          if (evolution.method[0] === 'level') {
            // Check if the level of the pokemon is equal to or greater than the value required for evolution
            if (pokemon.level < evolution.value) {
              meetsConditions = false;
            }
          }
          // Check if the first evolution method is item
          if (evolution.method[0] === 'item') {
            // Find the item in the inventory
            let item = inventory.find(i => i.name === evolution.value);
            // Check if the item exists and its amount is greater than 0
            if (!item || item.amount <= 0) {
              meetsConditions = false;
            }
          }
          // Check if the first evolution method is gender
          if (evolution.method[0] === 'gender') {
            // Check if the pokemon's gender matches the required gender for evolution
            if (pokemon.gender !== evolution.value) {
              meetsConditions = false;
            }
          }
          // Check if the evolution has a second value and if it meets the conditions
          if (evolution.value_2 && meetsConditions) {
            // Check if the second evolution method is level
            if (evolution.method[1] === 'level') {
              if (pokemon.level < evolution.value_2) {
                meetsConditions = false;
              }
            }
            // Check if the second evolution method is item
            if (evolution.method[1] === 'item') {
              let item = inventory.find(i => i.name === evolution.value_2);
              if (!item || item.amount <= 0) {
                meetsConditions = false;
              }
            }
            // Check if the second evolution method is gender
            if (evolution.method[1] === 'gender') {
              if (pokemon.gender !== evolution.value_2) {
                meetsConditions = false;
              }
            }
          }
          // If the evolution meets all conditions, add it to the list of available evolutions
          if (meetsConditions) {
            availableEvolutions.push(evolution);
          }
        }
        // If there are no available evolutions, exit the function
        if (availableEvolutions.length === 0) {
          return;
        }
        // If there is only one available evolution, use it
        else if (availableEvolutions.length === 1) {
          const chosenEvolutionData = availableEvolutions[0];
          // Replace the species of the pokemon with the evolved species
          team[index].species = chosenEvolutionData.evolves_to;
          // Find the evolved pokemon in the database
          const evolvedPokemon = pokemonDatabase.find(p => p.name === chosenEvolutionData.evolves_to);
          // Update the sprite URL to the evolved species
          let sprite = pokemon.isShiny ? evolvedPokemon.shiny_sprite : evolvedPokemon.sprite;
          if (pokemon.gender === 'Female' && evolvedPokemon.female_sprite) {
            sprite = pokemon.isShiny ? evolvedPokemon.female_shiny_sprite || evolvedPokemon.female_sprite : evolvedPokemon.female_sprite;
          }
          team[index].sprite = sprite;
          // Decrement the amount of the item used for evolution
          if (chosenEvolutionData.method[0] === 'item') {
            let item = inventory.find(i => i.name === chosenEvolutionData.value);
            item.amount--;
            localStorage.setItem("inventory", JSON.stringify(inventory));
          }
        }
        // If there are multiple available evolutions, prompt the user to choose one
        else {
          let promptMessage = "Multiple evolutions available. Choose one:\n";
          for (let i = 0; i < availableEvolutions.length; i++) {
            promptMessage += `${i + 1}. ${availableEvolutions[i].evolves_to}\n`;
          }
          let chosenIndex = prompt(promptMessage);
          // Check if the chosen index is valid
          if (chosenIndex >= 1 && chosenIndex <= availableEvolutions.length) {
            const chosenEvolutionData = availableEvolutions[chosenIndex - 1];
            // Replace the species of the pokemon with the evolved species
            team[index].species = chosenEvolutionData.evolves_to;
            // Find the evolved pokemon in the database
            const evolvedPokemon = pokemonDatabase.find(p => p.name === chosenEvolutionData.evolves_to);
            // Update the sprite URL to the evolved species
            let sprite = pokemon.isShiny ? evolvedPokemon.shiny_sprite : evolvedPokemon.sprite;
            if (pokemon.gender === 'Female' && evolvedPokemon.female_sprite) {
              sprite = pokemon.isShiny ? evolvedPokemon.female_shiny_sprite || evolvedPokemon.female_sprite : evolvedPokemon.female_sprite;
            }
            team[index].sprite = sprite;
            // Decrement the amount of the item used for evolution
            if (chosenEvolutionData.method[0] === 'item') {
              let item = inventory.find(i => i.name === chosenEvolutionData.value);
              item.amount--;
              localStorage.setItem("inventory", JSON.stringify(inventory));
            }
            const newPokemonName = team[index].species;
          }
        }
      }
      // If there is only one evolution available, use it
      else {
        const chosenEvolutionData = pokemonData.evolutions[0];
        // Replace the species of the pokemon with the evolved species
        team[index].species = chosenEvolutionData.evolves_to;
        // Find the evolved pokemon in the database
        const evolvedPokemon = pokemonDatabase.find(p => p.name === chosenEvolutionData.evolves_to);

        // Update the sprite URL to the evolved species
        if (evolvedPokemon.name === 'Dudunsparce') {
          const randomNum = Math.floor(Math.random() * 100);
          if (randomNum === 0) {
            team[index].sprite = pokemon.isShiny ? 'sprites/pokemon/shiny/982.1.png' : 'sprites/pokemon/982.1.png';
            alert(`Wait... What happened with your Dunsparce?!`);
          } else {
            let sprite = pokemon.isShiny ? evolvedPokemon.shiny_sprite : evolvedPokemon.sprite;
            if (pokemon.gender === 'Female' && evolvedPokemon.female_sprite) {
              sprite = pokemon.isShiny ? evolvedPokemon.female_shiny_sprite || evolvedPokemon.female_sprite : evolvedPokemon.female_sprite;
            }
            team[index].sprite = sprite;
          }
        } else if (evolvedPokemon.name === 'Vivillon') {
          let randomNum = Math.floor(Math.random() * 18);
          let spritePath = pokemon.isShiny ? `sprites/pokemon/shiny/666.${randomNum}.png` : `sprites/pokemon/666.${randomNum}.png`;

          while (team[index].sprite.endsWith(`666.${randomNum}.png`)) {
            randomNum = Math.floor(Math.random() * 18);
            spritePath = pokemon.isShiny ? `sprites/pokemon/shiny/666.${randomNum}.png` : `sprites/pokemon/666.${randomNum}.png`;
          }

          team[index].sprite = spritePath;
        } else if (evolvedPokemon.name === 'Alcremie') {
          const sweetType = prompt('Choose a Sweet type for your Alcremie (Strawberry, Berry, Love, Star, Clover, Flower, Ribbon :');
          const validSweets = ['Strawberry', 'Berry', 'Love', 'Star', 'Clover', 'Flower', 'Ribbon'];
          if (validSweets.includes(sweetType)) {
            const creamType = prompt('Choose a Cream type for your Alcremie (Vanilla, Ruby, Matcha, Mint, Lemon, Salted, Ruby Swirl, Caramel, Rainbow):');
            const validCreams = ['Vanilla', 'Ruby', 'Matcha', 'Mint', 'Lemon', 'Salted', 'Ruby Swirl', 'Caramel', 'Rainbow'];
            if (validCreams.includes(creamType)) {
              const sweetIndex = validSweets.indexOf(sweetType);
              const creamIndex = validCreams.indexOf(creamType);
              let sprite = `sprites/pokemon/869.${sweetIndex}.${creamIndex}.png`;
              if (pokemon.isShiny) {
                sprite = `sprites/pokemon/shiny/869.${sweetIndex}.png`;
              }
              team[index].sprite = sprite;
            } else {
              alert('Invalid Cream type! Evolution cancelled.');
              location.reload();
              return; // Cancel the evolution
            }
          } else {
            alert('Invalid Sweet type! Evolution cancelled.');
            location.reload();
            return; // Cancel the evolution
          }
        } else {
          let sprite = pokemon.isShiny ? evolvedPokemon.shiny_sprite : evolvedPokemon.sprite;
          if (pokemon.gender === 'Female' && evolvedPokemon.female_sprite) {
            sprite = pokemon.isShiny ? evolvedPokemon.female_shiny_sprite || evolvedPokemon.female_sprite : evolvedPokemon.female_sprite;
          }
          team[index].sprite = sprite;
        }

        if (evolvedPokemon.name === 'Maushold') {
          const randomNum = Math.floor(Math.random() * 100);
          if (randomNum === 0) {
            team[index].sprite = pokemon.isShiny ? 'sprites/pokemon/shiny/925.1.png' : 'sprites/pokemon/925.1.png';
            alert(`Wait... What happened with your thing?!`);
          } else {
            let sprite = pokemon.isShiny ? evolvedPokemon.shiny_sprite : evolvedPokemon.sprite;
            if (pokemon.gender === 'Female' && evolvedPokemon.female_sprite) {
              sprite = pokemon.isShiny ? evolvedPokemon.female_shiny_sprite || evolvedPokemon.female_sprite : evolvedPokemon.female_sprite;
            }
            team[index].sprite = sprite;
          }
        }

        if (evolvedPokemon.name === 'Unown') {
          let randomNum = Math.floor(Math.random() * 28) + 1;
          let spritePath = pokemon.isShiny ? `sprites/pokemon/shiny/201.${randomNum}.png` : `sprites/pokemon/201.${randomNum}.png`;

          while (team[index].sprite.endsWith(`201.${randomNum}.png`)) {
            randomNum = Math.floor(Math.random() * 28) + 1;
            spritePath = pokemon.isShiny ? `sprites/pokemon/shiny/201.${randomNum}.png` : `sprites/pokemon/201.${randomNum}.png`;
          }

          team[index].sprite = spritePath;
        }

        if (evolvedPokemon.name === 'Ninjask') {
          // Check if there is a free slot in the team
          if (team.length < 6) {
            // Create a new Shedinja object and push it to the team array
            const newPokemon = {
              species: 'Shedinja',
              eggSteps: 0,
              level: pokemon.level,
              experience: pokemon.experience,
              gender: pokemon.gender,
              isEgg: false,
              isShiny: pokemon.isShiny,
              sprite: pokemon.isShiny ? 'sprites/pokemon/shiny/292.png' : 'sprites/pokemon/292.png'
            };
            team.push(newPokemon);
            alert("Seems another Pokemon shown up next to your Ninjask...");
            location.reload();
          }
        }

        // Decrement the amount of the item used for evolution
        if (chosenEvolutionData.method[0] === 'item') {
          let item = inventory.find(i => i.name === chosenEvolutionData.value);
          item.amount--;
          localStorage.setItem("inventory", JSON.stringify(inventory));
        }
      }
    }
    // Save the updated team and inventory to local storage
    localStorage.setItem("team", JSON.stringify(team));
    localStorage.setItem("inventory", JSON.stringify(inventory));

    function updateUI(idx) {
      if (!isNaN(idx)) {
        let currentPokemon = team[idx];
        let nameElement = document.querySelector(`.team-box:nth-child(${idx + 1}) .pokemon-name`);
        if (nameElement) {
          nameElement.innerHTML = currentPokemon.species;
        }
        let sprite = `../` + currentPokemon.sprite;
        let spriteElement = document.querySelector(`.team-box:nth-child(${idx + 1}) .pokemon-sprite img`);
        if (spriteElement) {
          spriteElement.src = sprite;
        }

      }
    }

    // Remove the evolving button
    this.style.display = 'none';
    // Update the UI to reflect the evolution
    updateUI(index);
    localStorage.setItem("team", JSON.stringify(team));
    alert(`Your Pokémon has evolved into ${pokemon.species}!`)
    location.reload();
  });
});

// Call the checkEvolutionConditions function for each pokemon in the team array
for (let pokemon of team) {
  checkEvolutionConditions(pokemon, inventory);
}