import React, { Component } from 'react';
import { Container, Row, Col } from 'reactstrap';
import Header from './Header';
import Question from './Question';
import VoteButton from './VoteButton';
import RegisterBox from './RegisterBox';
import Card from "reactstrap/es/Card";
import CardBody from "reactstrap/es/CardBody";
import CardTitle from "reactstrap/es/CardTitle";
import CardText from "reactstrap/es/CardText";

let SERVER_URL = 'localhost:8080';

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            question: this.props.question,
            isRegistered: false,
            canVote: false,
            errorMessage: ''
        }
        // Binding is needed to be able access 'this' within the handler method!
        this.register = this.register.bind(this);
        this.vote = this.vote.bind(this);
    }

    async loadConfig() {
        try {
            const response = await fetch("application.json");
            const config = await response.json();
            SERVER_URL = config.SERVER_URL ? config.SERVER_URL : SERVER_URL;
            console.log("JSON-Config: Server set to '%s'", SERVER_URL);
        } catch (err) {
            console.log("File 'application.json' not found");
        }
    }

    componentDidMount() {
        console.log("Default: Server set to '%s'", SERVER_URL);
        SERVER_URL = process.env.REACT_APP_SERVER_URL ? process.env.REACT_APP_SERVER_URL : SERVER_URL;
        console.log("Env: Server set to '%s'", SERVER_URL);
        SERVER_URL = window._env.SERVER_URL ? window._env.SERVER_URL : SERVER_URL;
        console.log("JS-Config: Server set to '%s'", SERVER_URL);
        //this.loadConfig();
    }

    connectWebSocket() {
        this.socket = new WebSocket('ws://' + SERVER_URL + '/wsVoting');
        this.socket.onopen = () => {
            console.log('WebSocket connected successfully');
        };
        this.socket.onmessage = (messageEvent) => {
            console.log("message received: '%s'", messageEvent.data);
            this.setState({
                question: messageEvent.data,
                canVote: true
            });
        };
        this.socket.onclose = (event) => {
            console.warn(event);
            this.setState({
                errorMessage: 'System Reset!',
                question: this.props.question,
                isRegistered: false
            });
        };
    }

    async register(email) {
        if (email.length === 0) {
            console.error('No email set!')
            return
        }
        const tokenDto = {
            'email': email
        }
        const request = new Request('http://' + SERVER_URL + '/votes', {
            method: 'POST',
            headers: new Headers({
                'Content-Type': 'application/json'
            }),
            body: JSON.stringify(tokenDto)
        });
        try {
            const res = await fetch(request);
            if (!res.ok) {
                throw Error('Already registered from this computer!')
            }
            const js = await res.json();
            this.connectWebSocket();
            this.setState({
                isRegistered: true,
                token: js.token
            })
        } catch (err) {
            console.error(err);
            this.setState({
                errorMessage: err.message
            })
        }
    }

    async vote(answer) {
        if (this.state.canVote) {
            console.log(answer.message);
            const voteDTO = {
                vote: (answer.message === 'Yes' ? true : false)
            }
            const url = 'http://' + SERVER_URL + '/votes/' + this.state.token;
            var request = new Request(url, {
                method: 'PUT',
                headers: new Headers({
                    'Content-Type': 'application/json'
                }),
                body: JSON.stringify(voteDTO)
            });
            try {
                const response = await fetch(request);
                if (!response.ok) {
                    throw Error('HTTP Status Code received: ' + response.status)
                }
                this.setState({
                    canVote: false,
                    question: 'Waiting for new question...'
                })
            } catch (err) {
                console.error(err);
                this.setState({
                    canVote: false,
                    question: 'Error happened...'
                })
            }
        }
    }

    render() {
        return (
            <Container fluid>
                <Header
                    title='Interactive Voting System'
                    lead='v0.1.0' />
                {(!this.state.isRegistered) ? (
                    <RegisterBox handler={this.register}
                                 error={this.state.errorMessage}
                    />
                ) : (
                    <div>
                        <Row>
                            <Col>
                                <Question message={this.state.question} />
                            </Col>
                        </Row>
                        <Row>
                            <Col xs="6">
                                <VoteButton
                                    isActive={this.state.canVote}
                                    color='success'
                                    message='Yes'
                                    handler={this.vote} />
                            </Col>
                            <Col xs="6">
                                <VoteButton
                                    isActive={this.state.canVote}
                                    color='danger'
                                    message='No'
                                    handler={this.vote} />
                            </Col>
                        </Row>

                    </div>
                )}
                <Card>
                    <CardBody>
                        <CardTitle>Hallo</CardTitle>
                        <CardText>jfeifhrief</CardText>
                    </CardBody>
                </Card>
            </Container>
        );
    }
}

App.defaultProps = {
    question: 'Waiting for new question...'
}
export default App;
