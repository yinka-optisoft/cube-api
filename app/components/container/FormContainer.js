import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Input from '../presentational/Input';


import './styles.scss';
import './style.css';
class FormContainer extends Component {
  constructor() {
    super();
    this.state = {
      seoTitle: ''
    };
    this.handleChange = this.handleChange.bind(this);
  }
  handleChange(event) {
    this.setState({ [event.target.id]: event.target.value });
  }
  render() {
    const { seoTitle } = this.state;
    return (
      <form id="article-form">
        <span className="fa fa-frown-o" ></span>
        <Input
          text="SEO title"
          label="seo_title"
          type="text"
          id="seo_title"
          value={seoTitle}
          handleChange={this.handleChange}
        />
      </form>
    );
  }
}

const wrapper = document.getElementById('brim');
if (wrapper)
  ReactDOM.render(<FormContainer />, wrapper)

export default FormContainer;
