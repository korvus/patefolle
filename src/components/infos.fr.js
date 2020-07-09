
import React from "react"

export const Leaven = () => {return (<p>
    Le pourcentage est basé sur le poid de la farine. L'astuce réside dans le fait que le poid total de la farine inclus également la farine comprise dans le levain lui-même.<br /> Ex.: 90gr de farine + 20gr de levain, 
    cela donne 90+(20/2) = 100gr de farine (On considére par défaut que le levain est équitablement à 50% d'eau/50% de farine, ce qui fait 10gr de farine). 
    Conséquemment, le calcul va se baser sur ces 100gr de farine.<br />Le ratio idéal est autour des 18%</p>);}

export const Hydration = () => {return (<p>Comme pour le levain, le pourcentage est déterminé par rapport au poid total de la farine, incluant la farine contenue dans le levain, ainsi que l'eau dans ce même levain.</p>);}

export const Salt = () => {return (<p>Bien que le sel soit déterminant au niveau gustatif, afin de simplifier, j'ai fixé son taux à 2%.</p>);}
