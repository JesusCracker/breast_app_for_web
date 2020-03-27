import React, {Component} from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            error:false,
        };

    }

    componentDidCatch(error, info) {
        // Display fallback UI
        this.setState({ error: true });
        // You can also log the error to an error reporting service
    }

    render() {
        if (this.state.error) {
            // You can render any custom fallback UI
            return <h1>Something went wrong.</h1>;
        }
        return this.props.children;
    }
}

ErrorBoundary.propTypes = {};

export default ErrorBoundary;