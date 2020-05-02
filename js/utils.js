'use strict';
/*
    Title: Assignment 5 - Team Builder
    Author: Matt Walsh
    Date: 2020-04-20
    Description: Contains some utility functions used throughout the application
*/

export {removeChildren, formatPokemonNames};

function removeChildren(element){
    let childElement = element.lastElementChild;
    while(childElement){
        element.removeChild(childElement);
        childElement = element.lastElementChild;
    }        
}

function formatPokemonNames(name){
    let formattedName = v.chain(name)
    .replaceAll("-", " ")
    .capitalize()
    .value()

    return formattedName;
}
