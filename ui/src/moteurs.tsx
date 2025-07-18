import React, { useState } from 'react';

function Moteur() {
    return(
      <p>Détails Moteur</p>
    );
}

function List() {
    return(
      <p>List</p>
    );
}

export default function Moteurs() {

    const [ moteur, setMoteur ] = useState();

    if (moteur) {
        return(
          <Moteur />
        );
    } else {
        return(
            <List />
        );
    }
}