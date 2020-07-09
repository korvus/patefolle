
import React from "react"

export const Leaven = () => {return (<p>The ratio is based on the flour weight. Tricky part is Total flour weight include the flour included in the leaven itself.<br /> eg: 90gr of flour + 20gr leaven, with give 90+(20/2) = 100gr of flour (Since leaven is 50% water/50% flour, that make 10gr of flour). 
    So, the percentage will be based on this value of 100gr of flour.<br />The ideal ratio is around 18%</p>);}

export const Hydration = () => {return (<p>As leaven, this ratio is calculate from the flour quantity including the flour contained into the leaven, and water will also include water into leaven.</p>);}

export const Salt = () => {return (<p>Despite salt can be an important parameter for taste, I fix it to the rate of 2%.</p>);}

export const Bulkproofing = () => {return (<p>How long you want dough fermenting to rounding/pre-shaping. <br />Note you can delay this process by placing the breads in a cool place.</p>)}

export const Proofing = () => {return (<p>Now that your breads have been shaped, they need time to rise again and be filled with carbon dioxide again before you put them into the oven for baking.<br /> you can again delay the process by placing the breads in a cool place.</p>)}