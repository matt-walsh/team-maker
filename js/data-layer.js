'use strict';
/*
    Title: Assignment 5 - Team Builder
    Author: Matt Walsh
    Date: 2020-04-20
    Description: Handles retreiving data from various sources (API, LocalStorage)
*/
import{addSearchHandlers, fillPokeList, createTeamBlock} from './gui-builders.js';
(function(){
    const BASE_URL = "https://pokeapi.co/api/v2/";

    //check if pokemon list has been already been retreived and stored in local storage
    if(window.localStorage.getItem("pokemonList")){
        let pokemon = JSON.parse(window.localStorage.getItem("pokemonList"));
        let types = JSON.parse(window.localStorage.getItem("typeList"));

        //Set initial page state
        fillPokeList(pokemon);
        addSearchHandlers(pokemon, types);
        createTeamBlock();
    }
    else{
        //Fetch a list of pokemon
        let pokemonList = fetch(BASE_URL + "pokemon/?limit=1000")
        .then((res) => {
            return res.json();
        })

        //Fetch a list of types
        let typeList = fetch(BASE_URL + "type")
        .then ((res) => {
            return res.json();
        })

        let promiseArray = [pokemonList, typeList];

        Promise.all(promiseArray)
        .then((res) => {
            let pokemon = res[0].results;
            let types = res[1].results;
            console.log(res);
            // Save required data to local storage
            window.localStorage.setItem("pokemonList", JSON.stringify(pokemon));
            window.localStorage.setItem("typeList", JSON.stringify(types));

            //Set initial page state
            fillPokeList(pokemon);
            addSearchHandlers(pokemon, types);
            createTeamBlock();
        });


    }
})();