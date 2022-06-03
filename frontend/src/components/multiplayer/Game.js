import React, { useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import UserSpace from './UserSpace'
import ChatSpace from './ChatSpace'
import MultiplayerContext from './MultiplayerContext';

const Game = ({ socket }) => {
    const [personalQuestions, setPersonalQuestions] = useState([]);
    const [personalGuesses, setPersonalGuesses] = useState([]);
    const [phase, setPhase] = useState('null');
    const [otherQuestions, setOtherQuestions] = useState([]);
    const [inputType, setInputType] = useState({ type: '' })
    const [hp, setHP] = useState(null);

    const { username } = useContext(MultiplayerContext);

    const addNewItem = ({ inputValue, setNewInputValue }) => {
        if (inputValue) {
            // todo: add user field
            const newUserInput = {
                id: Date.now(),
                body: inputValue,
                inputType: inputType.type,
            }

            if (inputType.type === 'question') {
                socket.emit("question", inputValue);
            } else {
                socket.emit("guess", inputValue);
            }
            setNewInputValue('');
            setInputType({ type: '' });
        }
    }

    const setSockets = () => {
        socket.on('inputState', () => {
            console.log("Got inputState");
            setPhase("input");
        });
        socket.on('voteState', () => {
            console.log("Got voteState");
            setPhase("vote");
        });
        socket.on('otherQuestion', (question) => {
            console.log(`Got otherQuestion`);
            console.log(question);
            let questionWithVotes = { ...question, yes: 0, no: 0 };
            if (username === question.username) {
                setPersonalQuestions((prevPersonalQuestions) => [...prevPersonalQuestions, questionWithVotes]);
            } else {
                setOtherQuestions((prevOtherQuestions) => [...otherQuestions, questionWithVotes]);
            }
        });
        socket.on('guessResult', ({ correct, hp, text }) => {
            console.log("Got guessResult");
            setHP(hp);
            setPersonalGuesses((prevPersonalGuesses) => [...prevPersonalGuesses, { correct, text }]);
        });
        socket.on('otherVote', (vote) => {
            console.log("Got otherVote")
            if (vote.toThemselves) {
                setPersonalQuestions((prevPersonalQuestions) => {
                    console.log(`personalQuestions:`);
                    console.log(prevPersonalQuestions);
                    let newPersonalQuestions = [...prevPersonalQuestions];
                    let question = newPersonalQuestions[prevPersonalQuestions.length - 1];
                    if (vote.voteType === 'positive') {
                        question.yes += 1;
                    } else {
                        question.no += 1;
                    }
                    return newPersonalQuestions;
                });
            } else {
                setOtherQuestions((prevOtherQuestions) => {
                    console.log(`otherQuestions:`);
                    console.log(prevOtherQuestions);
                    let newOtherQuestions = [...prevOtherQuestions];
                    let question = newOtherQuestions.find((question) => question.questionId === vote.questionId);
                    if (vote.voteType === 'positive') {
                        question.yes += 1;
                    } else {
                        question.no += 1;
                    }
                    return newOtherQuestions;
                });
            }
        });
        socket.on("endState", (roomId) => {
            console.log("Got endState");
            socket.emit("leaveRoom", roomId);
        });
    }

    useEffect(setSockets, [otherQuestions, personalGuesses, personalQuestions, socket, username]);

    useEffect(() => {
        console.log(`Personal questions:`)
        console.log(personalQuestions);
    }, [personalQuestions]);

    useEffect(() => {
        console.log(`Other questions:`);
        console.log(otherQuestions);
    }, [otherQuestions]);

    return (
        <div>
            <UserSpace
                personalQuestions={personalQuestions}
                personalGuesses={personalGuesses}
                isEnabled={phase === 'input'}
                socket={socket}
                itemAdder={addNewItem}
                inputProps={{ type: inputType.type, typeSetter: setInputType }}
            />
            <ChatSpace isEnabled={phase === 'vote'} otherQuestions={otherQuestions} socket={socket} />
            <div>{hp}</div>
        </div>
    );
}

export default Game;