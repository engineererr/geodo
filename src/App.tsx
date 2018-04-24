import * as React from 'react';
import './App.css';

import 'bootstrap/dist/css/bootstrap-theme.css';
import 'bootstrap/dist/css/bootstrap.css';

import axios from 'axios';
import { Button } from 'react-bootstrap';

import { AsyncTypeahead } from 'react-bootstrap-typeahead';

import 'react-bootstrap-typeahead/css/Typeahead.css';

import logo from './logo.svg';

interface IAppState {
  isLoading: boolean;
  options: string[];
  flexItemsCount: number;
}

const apiEndpoint: string = "https://api3.geo.admin.ch/1804191145/rest/services/ech/SearchServer?sr=2056&lang=en&type=featuresearch&features=ch.bfs.gebaeude_wohnungs_register&timeEnabled=false&timeStamps=&searchText="
class App extends React.Component<{}, IAppState> {
  constructor(props: any) {
    super(props);
    this.state = {
      flexItemsCount: 1,
      isLoading: false,
      options: [],
    };
  }

  public render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to GEO-DO</h1>
        </header>
        <p className="App-intro">
          Search for your location first
        </p>


        <AsyncTypeahead
          placeholder="search your location"
          labelKey="search"
          isLoading={this.state.isLoading}
          onSearch={this.handleSearch}
          options={this.state.options}
          onChange={this.handleOnChange}
          delay={300}
          // tslint:disable-next-line jsx-no-lambda
          renderMenuItemChildren={(option, props) => (
            <span key={option.id}> {option} </span>
          )}
        />
        <h1>Solar Panels</h1>
        <Button onClick={this.handleAddFlexItem} value="add solar panel" >Add</Button>
        <Button onClick={this.handleRemoveFlexItem} value="remove solar panel" >Remove</Button>
        <div className="Flex-container">
          {this.renderSolarPanels()}
        </div>
      </div>
    );
  }

  private handleOnChange = (selected: string[]) => {
    console.log(selected.toString());
    this.makeAndHandleRequest(selected[0], false)
      // tslint:disable-next-line
      .then((result: string) => {
        if (result.indexOf("_") > 0) {
          result = result.substring(0, result.indexOf("_"));
        }
        console.log("found id in handleOnChange = " + result);
      });
  }
  private renderSolarPanels = () => {
    // tslint:disable-next-line
    let result = [];
    for (let i = 0; i < this.state.flexItemsCount; i++) {
      result.push(<div key={i} className="Flex-item">1qm</div>);
    }
    return result;
  }
  private handleAddFlexItem = () => {
    this.setState((prevState) => {
      return { flexItemsCount: prevState.flexItemsCount + 1 };
    });
  }

  private handleRemoveFlexItem = () => {
    this.setState((prevState) => {
      return { flexItemsCount: prevState.flexItemsCount - 1 };
    });
  }

  private handleSearch = (query: any) => {
    this.setState({ isLoading: true });

    this.makeAndHandleRequest(query, true)
      // tslint:disable-next-line
      .then((options) => {
        console.log("setting options in handleSearch = " + options);
        this.setState({
          isLoading: false,
          options,
        });
      });
  }

  private makeAndHandleRequest = (query: any, byLabel: boolean) => {
    // tslint:disable-next-line
    return axios.get(apiEndpoint + query).then((response) => {
      if (byLabel) {
        return response.data.results.map((res: any) => res.attrs.label)
      } else {
        return response.data.results[0].attrs.featureId;
      }
    }, (error) => {
      console.log(error);
    });
    // return new Promise((resolve, reject) => resolve({ "options": ["kai", "dominique"] }));
  };
}

export default App;
