import * as React from 'react';
import './App.css';

// tslint:disable-next-line
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap-theme.css';
import 'bootstrap/dist/css/bootstrap.css';
import { Button, Nav, Navbar, NavbarBrand, NavItem } from 'react-bootstrap';
import { AsyncTypeahead } from 'react-bootstrap-typeahead';

import 'react-bootstrap-typeahead/css/Typeahead.css';

import logo from './logo.svg';
import SolarChart from './SolarChart';

interface IAppState {
  isLoading: boolean;
  options: string[];
  panelCount: number;
  dataArray: object[];
  batterySize: number;
  kWhBought: number;
  kWhSold: number;
  kWhPriceTotal: number;
}

const dataSet = [
  { time: 0, production: 10, totalProduction: 0, consumtion: 3, batteryLevel: 0, totalEnergyOverflow: 0, kWhBought: 0, kWhSold: 0 },
  { time: 1, production: 10, totalProduction: 0, consumtion: 20, batteryLevel: 0, totalEnergyOverflow: 0, kWhBought: 0, kWhSold: 0 },
  { time: 2, production: 10, totalProduction: 0, consumtion: 3, batteryLevel: 0, totalEnergyOverflow: 0, kWhBought: 0, kWhSold: 0 },
  { time: 3, production: 10, totalProduction: 0, consumtion: 3, batteryLevel: 0, totalEnergyOverflow: 0, kWhBought: 0, kWhSold: 0 },
  { time: 4, production: 10, totalProduction: 0, consumtion: 3, batteryLevel: 0, totalEnergyOverflow: 0, kWhBought: 0, kWhSold: 0 },
];

const apiEndpoint: string = "https://api3.geo.admin.ch/1804191145/rest/services/ech/SearchServer?sr=2056&lang=en&type=featuresearch&features=ch.bfs.gebaeude_wohnungs_register&timeEnabled=false&timeStamps=&searchText="

const kWhSellPrice = 0.05;
const kWhBuyPrice = 0.20;

class App extends React.Component<any, IAppState> {
  constructor(props: any) {
    super(props);

    this.state = {
      batterySize: 50,
      dataArray: [],
      isLoading: false,
      kWhBought: 0,
      kWhPriceTotal: 0,
      kWhSold: 0,
      options: [],
      panelCount: 1,
    };
  }

  public componentDidMount() {
    this.calculate()
  }

  public calculateProduction(element: any): any {
    element.totalProduction = element.production * this.state.panelCount;
    return element;
  }

  public calculateBatteryLevel(element, previousBatteryLevel) {
    element.batteryLevel = previousBatteryLevel;
    element.kWhBought = 0;
    element.kWhSold = 0;
    const totalEnergyOverflow: number = element.totalProduction - element.consumtion;
    if (totalEnergyOverflow >= 0) {
      // overflow positive, energy is saved to battery
      if (element.batteryLevel + totalEnergyOverflow < this.state.batterySize) {
        // battery not yet full
        element.batteryLevel += totalEnergyOverflow;
      } else {
        // battery full
        element.batteryLevel = this.state.batterySize;
        element.kWhSold += element.batteryLevel + totalEnergyOverflow - this.state.batterySize;
      }
    } else {
      // overflow negative, energy from battery or Kraftwerk is used
      if (Math.abs(totalEnergyOverflow) < element.batteryLevel) {
        // battery not empty
        element.batteryLevel -= totalEnergyOverflow;
      } else {
        // battery empty
        const diff = Math.abs(totalEnergyOverflow) - element.batteryLevel;
        element.batteryLevel = 0;
        element.kWhBought = diff;
      }
    }
    return element;
  }

  public calculate() {
    let previousBatteryLevel = 0;
    let kWhBought = 0;
    let kWhSold = 0;
    let kWhPriceTotal = 0;
    const resultingDataSet: any[][] = [];
    resultingDataSet.push(['Zeit', 'Produktion', 'Verbrauch', 'Batterie', 'Gekaufte kWh', 'Verkaufte kWh']);

    dataSet.forEach(element => {
      element = this.calculateProduction(element);
      element = this.calculateBatteryLevel(element, previousBatteryLevel);
      kWhBought += element.kWhBought;
      kWhPriceTotal -= element.kWhBought * kWhBuyPrice;
      kWhSold += element.kWhSold;
      kWhPriceTotal += element.kWhSold * kWhSellPrice;
      kWhPriceTotal = Math.round(kWhPriceTotal * 100) / 100;
      resultingDataSet.push([element.time, element.totalProduction, element.consumtion, element.batteryLevel, element.kWhBought, element.kWhSold]);
      previousBatteryLevel = element.batteryLevel;
    });

    this.setState({ dataArray: resultingDataSet, kWhBought, kWhSold, kWhPriceTotal });
  }


  public render() {
    return (
      <div className="App" id="page-top" data-spy="scroll" data-target=".navbar" data-offset="50">
        <Navbar fixedTop={true}>
          <Navbar.Header>
            <NavbarBrand><a href="#page-top">GEODO</a></NavbarBrand>
          </Navbar.Header>
          <Nav>
            <NavItem eventKey={1} href="#sectionLoaction">
              Wohnort
            </NavItem>
            <NavItem eventKey={2} href="#sectionVerbraucherprofil">
              Verbraucherprofil
            </NavItem>
            <NavItem eventKey={3} href="#sectionSolarPanels">
              Solarpanels
            </NavItem>
            <NavItem eventKey={4} href="#sectionSolarChart">
              Resultat
            </NavItem>
          </Nav>
        </Navbar>
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to GEO-DO</h1>
        </header>
        <div className="sectionLocation" id="sectionLoaction">
          <div className="container">
            <h1>1. Suche deinen Standort</h1>
            <AsyncTypeahead
              placeholder="Wo wohnst du?"
              labelKey="search"
              isLoading={this.state.isLoading}
              onSearch={this.handleSearch}
              options={this.state.options}
              onChange={this.handleOnChange}
              delay={300}
              // tslint:disable-next-line:jsx-no-lambda
              renderMenuItemChildren={(option, props) => (
                <span key={option.id}> {option} </span>
              )}
            />
          </div>
        </div>
        <div className="sectionVerbraucherprofil" id="sectionVerbraucherprofil">
          <div className="container">
            <h1>2. Verbraucherprofil angeben</h1>
            <div className="Flex-container-verbraucherprofil">
              <div className="Flex-item-verbraucherprofil">Single</div>
              <div className="Flex-item-verbraucherprofil">Couple</div>
              <div className="Flex-item-verbraucherprofil">Family</div>
            </div>
          </div>
        </div>
        <div className="sectionSolarPanels" id="sectionSolarPanels">
          <div className="container">
            <h1>3. Anzahl Solar Panels auswählen</h1>
            <Button onClick={this.handleAddFlexItem} value="add solar panel" >Add</Button>
            <Button onClick={this.handleRemoveFlexItem} value="remove solar panel" >Remove</Button>
            <div className="Flex-container">
              {this.renderSolarPanels()}
            </div>
          </div>
          <div>kWhBought: {this.state.kWhBought} kWhSold: {this.state.kWhSold} kWhPriceTotal: {this.state.kWhPriceTotal}CHF</div>
          <Button onClick={this.handleAddRow} value="add row" >Add row</Button>
        </div>
        <div className="sectionSolarChart" id="sectionSolarChart">
          <div className="container">
            <h1>4. Deine Berechnungen</h1>
            <SolarChart dataArray={this.state.dataArray} />
          </div>
        </div>
      </div >
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
    let result: any = [];
    for (let i = 0; i < this.state.panelCount; i++) {
      result.push(<div key={i} className="Flex-item" />);
    }
    return result;
  }

  private handleAddRow = () => {
    dataSet.push({ time: 5, production: 10, totalProduction: 0, consumtion: 3, batteryLevel: 0, totalEnergyOverflow: 0, kWhBought: 0, kWhSold: 0 });
    this.calculate();
  }
  private handleAddFlexItem = () => {
    this.setState((prevState) => {
      if (prevState.panelCount === 20) { return { panelCount: prevState.panelCount }; }
      return { panelCount: prevState.panelCount + 1 };
    }, () => this.calculate());
  }

  private handleRemoveFlexItem = () => {
    this.setState((prevState) => {
      if (prevState.panelCount === 0) { return { panelCount: prevState.panelCount }; }
      return { panelCount: prevState.panelCount - 1 };
    }, () => this.calculate());
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
    // return new Promise((resolve, reject) => resolve({"options": ["kai", "dominique"] }));
  };
}

export default App;
