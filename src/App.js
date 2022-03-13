import React from 'react';
import './App.css';
import "./weather-icons.min.css";
import 'font-awesome/css/font-awesome.min.css';

function App() {
  return (
    <div className="App">
      <Test />

    </div>
  );
}

class Test extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      loaded: true,
      lat: "",
      lon: "",
      weatherData: ["nodata", 420, 69],
      tempType: "f",
    }
    this.callWeatherApi = this.callWeatherApi.bind(this)
    this.callGeoApi = this.callGeoApi.bind(this)
  }
  componentDidMount(){
    this.callGeoApi("Tokyo")
    
  }
  
  callGeoApi(arg){
    let url = `http://api.openweathermap.org/geo/1.0/direct?q=${arg}&limit=1&appid=a294a1674de39e1e6e98930eeb1562ba`
    fetch(url)
    .then(res => res.json())
    .then(json => {
      this.setState({
        lat: json[0].lat,
        lon: json[0].lon
      })
    })
  }

  callWeatherApi(){
    console.log(this.state.lat)
    console.log(this.state.lon)
    let url = `https://api.openweathermap.org/data/2.5/weather?lat=${this.state.lat}&lon=${this.state.lon}&appid=a294a1674de39e1e6e98930eeb1562ba`
    console.log(url)
    fetch(url)
    .then(res => res.json())
    .then(json => {
      this.setState({
        weatherData: [json.weather, json.main.temp, json.main.humidity]
      }, () => console.log(this.state.weatherData))
    })    
  }

  render(){
    if(!this.state.loaded){
      return (<div>Loading...</div>)
    }
    else
    {return(
      <div>
        <button onClick={this.callWeatherApi}>CLICK HERE</button>
        <Template 
          weatherMain={this.state.weatherData[0][0].main}
          temp={this.state.tempType === "celsius"
                ? (this.state.weatherData[1] - 273.15).toFixed(1) + "°C"
                : this.state.tempType === "kelvin"
                ? this.state.weatherData[1].toFixed(1) + "°K"
                : (((this.state.weatherData[1] - 273) * 9/5) + 32).toFixed(1) + "°F"
              }
          humidity= {this.state.weatherData[2] + "%"}
        />
      </div>
    )}
  }
}

const Template  = (props) =>{
  return(
    <div className="template-wrapper">
      <div className='flex-container'>
        <h1>{props.weatherMain} <i class="wi wi-owm-day-202" /> </h1>
        <i class="wi wi-night-sleet"></i>
        <span className="info">{props.temp}</span>
        <span className="info">{props.humidity}</span>
      </div>
      
      <p>{props.desc}</p>
    </div>
  )
}

export default App;
