import React, {useState} from 'react';

const Counter = function() {
    const [likes, setLikes] = useState(0)

    function increaseLikes() {
        setLikes(likes + 1);
    }
  
    function decreaseLikes() {
      setLikes(likes - 1);
  }

    return (
        <div>
            <h1>{likes}</h1>
            <button onClick={increaseLikes}>Increment</button>
            <button onClick={decreaseLikes}>DecreaseDecrement</button>
        </div>
    )
}

export default Counter
