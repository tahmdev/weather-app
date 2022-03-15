import React from 'react';
import './App.css';
import "./weather-icons.min.css";
import { Line } from "react-chartjs-2";
import { Chart, registerables } from 'chart.js';
import 'font-awesome/css/font-awesome.min.css';

Chart.register(...registerables);


function App() {
  return (
    <div className="App">
      <Test />

    </div>
  );
}
// TODO: , check mobile

class Test extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      searchInput: "",
      lat: "",
      lon: "",
      weatherMain: "",
      weatherIcon: "",
      weatherDesc: "",
      temp: 0,
      feelLike: 0,
      humidity: 0,
      tempType: "C",
      forecast: [],
      hourly: [],
      weekdays: ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday', 'Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
    }
    this.callWeatherApi = this.callWeatherApi.bind(this)
    this.callGeoApi = this.callGeoApi.bind(this)
    this.convertTemp = this.convertTemp.bind(this)
    this.rng = this.rng.bind(this)
    this.getWeekday = this.getWeekday.bind(this)
    this.get24HourForecast = this.get24HourForecast.bind(this)
    this.getLabels = this.getLabels.bind(this)
    this.handleSearch = this.handleSearch.bind(this)
    this.switchTempType = this.switchTempType.bind(this)
  }
  //provide random data on mount
  componentDidMount(){
    this.setState({
      lat: this.rng(-90, 90),
      lon: this.rng(-180, 180)
    }, () => this.callWeatherApi())
  }
  //used to provide random longtitude and lantitude 
  rng(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  };
  //gets longtitude and langtitude data based on location name, then calls weather api
  callGeoApi(arg){
    let url = `http://api.openweathermap.org/geo/1.0/direct?q=${arg}&limit=1&appid=a294a1674de39e1e6e98930eeb1562ba`
    fetch(url)
    .then(res => res.json())
    .then(json => {
      this.setState({
        lat: json[0].lat,
        lon: json[0].lon
      }, () => this.callWeatherApi() )
    })
  }
  
  //updates states with weather data based on longtitude and langtitude
  callWeatherApi(){
    //convert country code to country name
    const regionNamesInEnglish = new Intl.DisplayNames(['en'], { type: 'region' });
    //fetches data 

    let url = `https://api.openweathermap.org/data/2.5/onecall?lat=${this.state.lat}&lon=${this.state.lon}&cnt=7&appid=a294a1674de39e1e6e98930eeb1562ba`
    fetch(url)
    .then(res => res.json())
    .then(json => {
      let forecastArr = [...json.daily]
      forecastArr.shift()
      this.setState({
        weatherMain: json.current.weather[0].main,
        weatherIcon: json.current.weather[0].id,
        weatherDesc: json.current.weather[0].description,
        temp: json.current.temp,
        humidity: json.current.humidity,
        feelLike: json.current.feels_like,
        forecast: forecastArr,
        hourly: json.hourly,
      })
    })
  }
  //converts temperature date from K to C and F based on state
  convertTemp(arg){
      switch (this.state.tempType){
        case "C":
          return (arg - 273.15).toFixed(1)
        case "K": 
          return arg.toFixed(1)
        case "F": 
          return (((arg - 273) * 9/5) + 32).toFixed(1)

      }
  }
  getWeekday(arg){
    let now = new Date();
    return this.state.weekdays[now.getDay() + arg + 1]
    
  }
  //Calls Geo api with the inputs current value
  handleSearch(){
    this.setState({
      searchInput: document.getElementById("search-bar").value
    }, () => this.callGeoApi(this.state.searchInput))
  }

  //Cycles through temperature types (C -> F -> K)
  switchTempType(){
    
    this.setState({
      tempType: this.state.tempType === "C"
      ? "F"
      : this.state.tempType === "F"
      ? "K"
      : this.state.tempType === "K"
      ? "C"
      : null
    })
  }
  //Insert the converted hourly temperature into the chart  
  get24HourForecast(){
    let res = this.state.hourly.map(item => item.temp)
    res = res.map(item => this.convertTemp(item))
    return res;
  }
  //Insert the hour labels into the chart
  getLabels(){
    let now = new Date();
    let hour = now.getHours();
    let arr = []
    for (let i = 0; i < 24; i++){
      if(hour+i >= 24){
        arr = [...arr, hour + i -24]
      }else{
        arr = [...arr, hour + i]
      }
    }
    console.log(arr)
    return arr;
  }
  render(){
    return(
      <div>
        <div id="top-controls">
          <button onClick={this.switchTempType} id="temp-switch" style={this.state.tempType === "C" ? {backgroundColor: "#a8323a"} : this.state.tempType === "F" ? {backgroundColor: "#32a852"} : {backgroundColor: "#cfb942"}}>{this.state.tempType}</button>
          <input type="text" id="search-bar" placeholder='Enter your location' onKeyDown={e => e.key === "Enter" ? this.handleSearch() : null} /> 
          <button id="search-btn" onClick={this.handleSearch}><i className="fa fa-search"></i></button>
        </div>
        
        <div id="today-wrapper">
          <Template 
            weatherMain={this.state.weatherMain}
            icon = {`wi wi-owm-${this.state.weatherIcon}`}
            desc = {this.state.weatherDesc}
            temp= {this.convertTemp(this.state.temp) + "°" + this.state.tempType}
            humidity = {this.state.humidity + "%"}
            feelslike = {this.convertTemp(this.state.feelLike) + "°" + this.state.tempType}
            location = {this.state.location}
          />
          <Chort labels={this.getLabels()} 
          data={this.get24HourForecast()}/>
        </div>
        
        <div id="forecast-wrapper">
          {
            this.state.forecast.map((item, idx) => {
              return(
                <Template 
                key= {idx}
                weatherMain={item.weather[0].main}
                icon = {`wi wi-owm-${item.weather[0].id}`}
                temp= {this.convertTemp(item.temp.day) + "°" + this.state.tempType}
                humidity = {item.humidity + "%"}
                feelslike = {this.convertTemp(item.feels_like.day) + "°" + this.state.tempType}
                weekDay = {this.getWeekday(idx)}
                />
              )
            })
          }
        </div>
      </div>
    )
  }
}

//Template for data output
const Template  = (props) =>{
  return(
    <div className="template-wrapper">
      <div className='flex-container'>
        <h2 >{props.weekDay}</h2>
        <h1> {props.weatherMain} <i id="icon" className={props.icon} /> </h1>
        <h2>{props.desc}</h2>
        <span className="info">Temperature: {props.temp}</span>
        <span className="info">Humidity: {props.humidity}</span>
        <span className="info">Feels like: {props.feelslike}</span>
        <span className="info location">{props.location}</span>
      </div>
    </div>
  )
}


const Chort = (props) => {
  return(
  <div id="chart">
    <Line 
    data={
      {
        labels: props.labels,
        datasets: [
          {
            backgroundColor: "#f5ad42",
            borderColor: "#f5ad42",
            label: "",
            data: props.data
          }
        ]
      }  
    }
    options={
      {
        plugins:{
          legend:{
            display: false,
          }
        }
      }
    }
   
  />
  </div>)
  
}
export default App;
