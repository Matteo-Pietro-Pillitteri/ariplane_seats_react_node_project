import { useState, useEffect } from 'react';
import { ProgressBar } from 'react-bootstrap';

function MyProgressBar(props){
    const [percentage, setPercentage] = useState(30);
    let variantColor;
  
    switch(props.operation){
        case "delete":
            variantColor = "danger";
        break;

        case "book":
            variantColor = "success";
        break;
        
    }

    useEffect(() =>{
        setTimeout(() => setPercentage((percentage) => percentage + 50), 5);
    }, [percentage])

    return(
        <ProgressBar animated variant={variantColor} now={percentage} className='mb-2' />
    );
}

export default MyProgressBar;