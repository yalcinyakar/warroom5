import React, { useEffect, useState } from 'react';
import { Container, Typography, Button, Box } from '@mui/material';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import { auth, database, firestore } from './firebaseConfig';


interface Question {
    id: string;
    title: string;
    options: string[];
    correctOption: string;
    points: number;
}
const function1 = firebase.functions().httpsCallable('function1');
function1({ /* data object */ })
    .then((result) => {
        // Handle the result of the function call
        console.log(result.data);
    })
    .catch((error) => {
        // Handle any errors that occurred during the function call
        console.error(error);
    });

const Game: React.FC = () => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
    const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
    const [score, setScore] = useState(0);
    const [isGameOver, setIsGameOver] = useState(false);
    const [remainingTime, setRemainingTime] = useState(10);
    const [timerActive, setTimerActive] = useState(false);
    const [timeTaken, setTimeTaken] = useState(0);
    const [playerNickname, setPlayerNickname] = useState('');

    useEffect(() => {
        fetchQuestions();
        fetchPlayerNickname();
    }, []);

    const fetchQuestions = async () => {
        try {
            const snapshot = await database.ref('questions').once('value');
            const questionsData = snapshot.val();
            if (questionsData) {
                const questionsArray = Object.keys(questionsData).map((key) => ({
                    id: key,
                    ...questionsData[key],
                    points: 100, // Update the initial points to 100
                })) as Question[];
                setQuestions(questionsArray);
            }
        } catch (error) {
            console.log('Error fetching questions:', error);
        }
    };

    const fetchPlayerNickname = () => {
        const user = firebase.auth().currentUser;
        if (user) {
            const userUUID = user.uid;
            const playerNicknameRef = database.ref(`users/${userUUID}/nickname`);
            playerNicknameRef.once('value', (snapshot) => {
                const nickname = snapshot.val();
                setPlayerNickname(nickname || '');
            });
        }
    };

    const startGame = () => {
        setScore(0);
        setIsGameOver(false);
        setCurrentQuestionIndex(0);
        setSelectedChoice(null);
        setRemainingTime(10);
        setTimerActive(true);
    };

    const handleChoiceSelect = (choice: string) => {
        setSelectedChoice(choice);

        // Calculate the time taken by the player
        const timeTaken = 10 - remainingTime;
        console.log(`Player ${playerNickname} selected: ${choice}`);
        console.log(`Player ${playerNickname} answered the question in ${timeTaken} seconds.`);
        setTimeTaken(timeTaken);
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex >= questions.length) {
            setIsGameOver(true);
            return;
        }

        const question = questions[currentQuestionIndex];
        let questionScore = 0;

        if (question && selectedChoice === question.correctOption) {
            questionScore = (10 - timeTaken) * 100;
            console.log('Correct answer! Score:', questionScore);
        } else if (selectedChoice !== null) {
            console.log('Incorrect answer! Score:', questionScore);
        } else {
            console.log('No answer! Score:', questionScore);
        }

        setScore((prevScore) => prevScore + questionScore);
        setSelectedChoice(null);
        setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
        setRemainingTime(10);
        setTimerActive(true);
    };

    useEffect(() => {
        if (currentQuestionIndex >= questions.length) {
            setIsGameOver(true);
        }
    }, [currentQuestionIndex, questions]);

    useEffect(() => {
        if (remainingTime === 0) {
            handleNextQuestion();
        }
    }, [remainingTime]);

    useEffect(() => {
        if (currentQuestionIndex < questions.length) {
            setRemainingTime(10);
            setTimerActive(true);
        }
    }, [currentQuestionIndex, questions]);

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if (timerActive) {
            interval = setInterval(() => {
                setRemainingTime((prevTime) => prevTime - 1);
            }, 1000);
        }
        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [timerActive]);

    return (
        <Container maxWidth="sm" sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="h4" component="h1" gutterBottom>
                WarRoom
            </Typography>

            {isGameOver ? (
                <div>
                    <Typography variant="h5" component="h2">
                        Game Over
                    </Typography>
                    <Typography variant="body1">Your score: {score}</Typography>
                    <Button variant="contained" onClick={startGame}>
                        Play Again
                    </Button>
                </div>
            ) : (
                <div>
                    {currentQuestionIndex < questions.length && (
                        <div>
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="h6" component="h3">
                                    Question {currentQuestionIndex + 1}: {questions[currentQuestionIndex].title}
                                </Typography>
                            </Box>
                            <div>
                                {questions[currentQuestionIndex].options.map((choice) => (
                                    <Button
                                        key={choice}
                                        variant="outlined"
                                        onClick={() => handleChoiceSelect(choice)}
                                        sx={{ m: 1, textAlign: 'left' }}
                                        disabled={selectedChoice !== null || !timerActive}
                                        fullWidth
                                    >
                                        {choice}
                                    </Button>
                                ))}
                            </div>
                            <Box sx={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', mt: 2 }}>
                                <Typography variant="h6" component="h3">
                                    Remaining Time: {remainingTime} seconds
                                </Typography>
                                <Typography variant="h6" component="h3">
                                    Score: {score}
                                </Typography>
                            </Box>
                        </div>
                    )}
                </div>
            )}
        </Container>
    );
};

export default Game;
