'use strict';
/*
    Title: Assignment 5 - Team Builder
    Author: Matt Walsh
    Date: 2020-04-20
    Description: Handles creating UI elements (Pokemon List, Team List, Pokemon Details)
*/

export {addSearchHandlers, fillPokeList, createPokeStatBlock, createTeamBlock}
import {removeChildren, formatPokemonNames} from './utils.js';

let pokemonList = [];

//Adds Event Handlers Related to Search
function addSearchHandlers(pokemon, types){
    let searchBox = document.getElementById("search-field")
    let pokemonSearch = document.getElementById("search-name")
    let typeSearch = document.getElementById("search-type");
    
    //Search Box
    searchBox.addEventListener("keyup", (event) => {
        //If the search box is empty, show all pokemon.
        if(event.target.value === ""){
            fillPokeList(pokemon)
        }
        else{
            if(pokemonSearch.checked){
                let fuseOptions = {
                    threshold: 0.0,
                    keys: [
                        "name"
                    ]
                }
                //Use fuse.js to search for pokemon by name
                let fuse = new Fuse(pokemon, fuseOptions);
                let searchResults = fuse.search(event.target.value).map( (result) => {
                    return result.item;
                })
                fillPokeList(searchResults);
            }
            else if (typeSearch.checked){
                let fuseOptions = {
                    threshold: 0.0,
                    keys: [
                        "name"
                    ]
                }
                //Use fuse.js to search for pokemon by type
                let fuse = new Fuse(types, fuseOptions);
                let searchResults = fuse.search(event.target.value).map( (result) => {
                    return result.item;
                })

                //Access the list of pokemon from the type search results 
                let promiseArray = searchResults.map((result) => {
                    return fetch(result.url).then((res) => {return res.json()});
                })
                Promise.all(promiseArray).then((data) =>{
                    //Handle if more than one type is returned by reducing multiple arrays into one.
                    let pokemonList = data.reduce((accumulator, currentValue) =>{
                        currentValue.pokemon.forEach( (value) =>{
                            accumulator.push(value.pokemon);
                        }) 
                        return accumulator;
                    }, []);

                    //Remove duplicate pokemon
                    pokemonList = pokemonList.filter((pokemonObject, index, self) => {
                        return index === self.findIndex((item) => (item.name === pokemonObject.name))
                    })
                    fillPokeList(pokemonList);
                })
            }
        }
    })
}

//Takes an array of Pokemon/URL Objects and adds them to the poke-select list
function fillPokeList(data){
    let pokeSelect = document.getElementById('poke-select');

    //Check if pokeSelect has any children nodes, and if so, remove them.
    if(pokeSelect.hasChildNodes){
        removeChildren(pokeSelect);
    }

    //Create elements for each result in data, and append them to pokeList
    let pokeList = document.createElement('ul');
    data.forEach( pokemon => {
        let listItem = document.createElement("li");
        let pokemonLink = document.createElement("a");

        pokemonLink.setAttribute("href", pokemon.url);
        pokemonLink.innerHTML = formatPokemonNames(pokemon.name);
        pokemonLink.addEventListener("click", (event) =>{
            event.preventDefault();
            let pokeStats = document.getElementById("poke-stat-block");

            //fetch data from url
            let pokemonURL = event.target.getAttribute("href");
            fetch(pokemonURL)
            .then((res) => {
                return res.json();
            })
            .then((json) => {
                //if pokeData has any children, remove them
                if(pokeStats.hasChildNodes()){
                    removeChildren(pokeStats);
                }

                //Append the pokemon's stat block
                createPokeStatBlock(json, pokeStats);
            })
        })
        listItem.appendChild(pokemonLink);
        pokeList.appendChild(listItem);
    })

    //Add pokeList to pokeSelect
    pokeSelect.appendChild(pokeList);
}

//Takes in a Pokemon data object and a parent element, generates a Stat block, and appends it to the parent
function createPokeStatBlock(pokemonData, parentElement){
    //Image
    let pokeImage = document.createElement("img");
    if(pokemonData.sprites.front_default !== null){
        pokeImage.setAttribute("src", pokemonData.sprites.front_default);
    }
    else{
        pokeImage.setAttribute("src", "img/no-image.png");
    }
    
    pokeImage.setAttribute("alt", `Image of ${pokemonData.name}`);

    //Name
    let pokeName = document.createElement("h2");
    pokeName.setAttribute("id", "poke-stats-name");
    pokeName.innerHTML = formatPokemonNames(pokemonData.name);

    //Stats
    let pokeStatBlock = document.createElement("div");
    pokeStatBlock.setAttribute("class", "poke-stats-stats");
    
    let statArray = pokemonData.stats.reverse();
    statArray.forEach( (stat) =>{
        let statSpan = document.createElement("span");
        statSpan.innerHTML = `${stat.stat.name.toUpperCase()}: ${stat.base_stat}`;
        pokeStatBlock.appendChild(statSpan);
    })

    //Details
    let pokeTypeBadges = document.createElement("div");
    pokeTypeBadges.setAttribute("class", "poke-types")

    pokemonData.types.forEach((type) =>{
        let typeDiv = document.createElement("div");
        typeDiv.setAttribute("class", "type-badge");
        typeDiv.setAttribute("id", type.type.name);
        typeDiv.innerHTML = type.type.name.toUpperCase();

        pokeTypeBadges.appendChild(typeDiv);
    })

    //Add to Party Button
    let addButton = document.createElement("button");
    addButton.setAttribute("id","add-pokemon-button");
    addButton.innerHTML = "Add";
    addButton.addEventListener("click", (event) =>{
        let pokemon = {
            "name" : pokemonData.name,
            "img" : pokeImage.getAttribute("src"),
        }

        let statArray = pokemonData.stats.reverse();
        statArray.forEach( (stat) =>{
            pokemon[v.camelCase(stat.stat.name)] = Number.parseInt(stat.base_stat);
        });

        if(pokemonList.length < 6){
            pokemonList.push(pokemon);
        }
        
        createTeamBlock();
    })

    parentElement.appendChild(pokeImage);
    parentElement.appendChild(pokeName);
    parentElement.appendChild(pokeStatBlock);
    parentElement.appendChild(pokeTypeBadges);
    parentElement.appendChild(addButton);
}

//Takes in Team data and a parent, generates a small stat block for each pokemon, and adds to the Team Gui, then appends the Team Gui to the parent
function createTeamBlock(){
    let teamContainer = document.getElementById("poke-team")

    //Check if teamContainer has any children nodes, and if so, remove them.
    if(teamContainer.hasChildNodes){
        removeChildren(teamContainer);
    }

    //Generate Stat block for each pokemon
    pokemonList.forEach((pokemon) =>{
        let pokeStatBlock = document.createElement("div");
        pokeStatBlock.setAttribute("class", "team-pokemon");
        
        //Name
        let pokeName = document.createElement("h2")
        pokeName.innerHTML = v.capitalize(pokemon.name);
        pokeStatBlock.appendChild(pokeName);

        //Image
        let pokeImage = document.createElement("img");
        pokeImage.setAttribute("src", pokemon.img);
        pokeImage.setAttribute("alt", `Image of ${pokemon.name}`);
        pokeStatBlock.appendChild(pokeImage);

        //Stats
        let pokeStat = document.createElement("div");
        
        let hp = document.createElement("span");
        hp.innerHTML = `HP: ${pokemon.hp}`;

        let attack = document.createElement("span");
        attack.innerHTML = `Atk: ${pokemon.attack}`;

        let defense = document.createElement("span");
        defense.innerHTML = `Def: ${pokemon.defense}`;

        let specialAttack = document.createElement("span");
        specialAttack.innerHTML = `Sp.Atk: ${pokemon.specialAttack}`;

        let specialDefense = document.createElement("span");
        specialDefense.innerHTML = `Sp.Def: ${pokemon.specialDefense}`;

        let speed = document.createElement("span");
        speed.innerHTML = `Spd: ${pokemon.speed}`;

        //Add Spans to Div
        pokeStat.appendChild(hp);
        pokeStat.appendChild(attack);
        pokeStat.appendChild(defense);
        pokeStat.appendChild(specialAttack);
        pokeStat.appendChild(specialDefense);
        pokeStat.appendChild(speed);

        //Add Remove button to Div
        let removeButton = document.createElement("button");
        removeButton.setAttribute("id","rem-pokemon-button");
        removeButton.innerHTML = "Remove";
        removeButton.addEventListener("click", (event) =>{
            let pokemonIndex = pokemonList.indexOf(pokemon);
            pokemonList.splice(pokemonIndex, 1);
            createTeamBlock();
        })

        pokeStat.appendChild(removeButton);

        //Add Div to Stat Block
        pokeStatBlock.appendChild(pokeStat);
        

        //Add Stat Block to Team Container
        teamContainer.appendChild(pokeStatBlock);
    });

    //Generate empty blocks for the remaining party
    let emptyBlockCount = 6 - pokemonList.length;
    for (let i = 0; i < emptyBlockCount; i++) {
        let emptyNode = document.createElement("div");
        emptyNode.setAttribute("class", "team-pokemon");
        
        teamContainer.appendChild(emptyNode);
    }

    //Recalculate Stats
    createTeamStatBlock();
}

function createTeamStatBlock(){
    let teamStatContainer = document.getElementById("poke-stats");
    
    //Check if teamStatBlock has any children nodes, and if so, remove them.
    if(teamStatContainer.hasChildNodes){
        removeChildren(teamStatContainer);
    }

    //Average Stats
    let averageHp;
    let averageAttack;
    let averageDefense;
    let averageSpAttack;
    let averageSpDefense;
    let averageSpeed;

    if(pokemonList.length !== 0){
        averageHp = Math.floor(pokemonList.reduce((accumulator, currentValue) => accumulator + currentValue.hp, 0) / pokemonList.length);
        averageAttack = Math.floor(pokemonList.reduce((accumulator, currentValue) => accumulator + currentValue.attack, 0) / pokemonList.length);
        averageDefense = Math.floor(pokemonList.reduce((accumulator, currentValue) => accumulator + currentValue.defense, 0) / pokemonList.length);
        averageSpAttack = Math.floor(pokemonList.reduce((accumulator, currentValue) => accumulator + currentValue.specialAttack, 0) / pokemonList.length);
        averageSpDefense = Math.floor(pokemonList.reduce((accumulator, currentValue) => accumulator + currentValue.specialDefense, 0) / pokemonList.length);
        averageSpeed = Math.floor(pokemonList.reduce((accumulator, currentValue) => accumulator + currentValue.speed, 0) / pokemonList.length);
    }
    else{
        averageHp = 0;
        averageAttack = 0;
        averageDefense = 0;
        averageSpAttack = 0;
        averageSpDefense = 0;
        averageSpeed = 0;
    }

    //Hp
    let averageHpContainer = document.createElement("div");
    averageHpContainer.setAttribute("class", "average-container");

    let hpLabel = document.createElement("span");
    hpLabel.innerHTML = "Average Team Hp";
    averageHpContainer.appendChild(hpLabel);

    let hpValue = document.createElement("span");
    hpValue.innerHTML = averageHp;
    averageHpContainer.appendChild(hpValue);

    teamStatContainer.appendChild(averageHpContainer);

    //Attack
    let averageAttackContainer = document.createElement("div");
    averageAttackContainer.setAttribute("class", "average-container");

    let attackLabel = document.createElement("span");
    attackLabel.innerHTML = "Average Team Attack";
    averageAttackContainer.appendChild(attackLabel);

    let attackValue = document.createElement("span");
    attackValue.innerHTML = averageAttack;
    averageAttackContainer.appendChild(attackValue);

    teamStatContainer.appendChild(averageAttackContainer);

    //Defense
    let averageDefenseContainer = document.createElement("div");
    averageDefenseContainer.setAttribute("class", "average-container");

    let defenseLabel = document.createElement("span");
    defenseLabel.innerHTML = "Average Team Defence";
    averageDefenseContainer.appendChild(defenseLabel);

    let defenseValue = document.createElement("span");
    defenseValue.innerHTML = averageDefense;
    averageDefenseContainer.appendChild(defenseValue);

    teamStatContainer.appendChild(averageDefenseContainer);

    //Sp. Attack
    let averageSpAttackContainer = document.createElement("div");
    averageSpAttackContainer.setAttribute("class", "average-container");

    let spAttackLabel = document.createElement("span");
    spAttackLabel.innerHTML = "Average Team Sp. Attack";
    averageSpAttackContainer.appendChild(spAttackLabel);

    let spAttackValue = document.createElement("span");
    spAttackValue.innerHTML = averageSpAttack;
    averageSpAttackContainer.appendChild(spAttackValue);

    teamStatContainer.appendChild(averageSpAttackContainer);

    //Sp. Defense
    let averageSpDefenseContainer = document.createElement("div");
    averageSpDefenseContainer.setAttribute("class", "average-container");

    let spDefenseLabel = document.createElement("span");
    spDefenseLabel.innerHTML = "Average Team Sp. Defence";
    averageSpDefenseContainer.appendChild(spDefenseLabel);

    let spDefenseValue = document.createElement("span");
    spDefenseValue.innerHTML = averageSpDefense;
    averageSpDefenseContainer.appendChild(spDefenseValue);

    teamStatContainer.appendChild(averageSpDefenseContainer);

    //Speed
    let averageSpeedContainer = document.createElement("div");
    averageSpeedContainer.setAttribute("class", "average-container");

    let speedLabel = document.createElement("span");
    speedLabel.innerHTML = "Average Team Speed";
    averageSpeedContainer.appendChild(speedLabel);

    let speedValue = document.createElement("span");
    speedValue.innerHTML = averageSpeed;
    averageSpeedContainer.appendChild(speedValue);

    teamStatContainer.appendChild(averageSpeedContainer);
}
