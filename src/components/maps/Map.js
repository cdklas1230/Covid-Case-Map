import React, { Component } from 'react';
import GoogleMapReact from 'google-map-react';
import CountyCard from '../cards/CountyCard';
import StateCard from '../cards/StateCard';
import { MapServices } from '../../services/MapServices';
import { MapUtils } from '../../util/MapUtils';

const PointMarker = ({ children }) => children;

class Map extends Component {
  static defaultProps = {
    center: {
      lat: 42,
      lng: -74
    },
    zoom: 11
  };

  state = {
      zoom: 11,
      boundary: null,
      points: {},
  }

  render() {
    return (
      // Important! Always set the container height explicitly
      <div style={{ height: '100vh', width: '100%' }}>
        <GoogleMapReact
          bootstrapURLKeys={{ key: "**********" }}
          defaultCenter={this.props.center}
          defaultZoom={this.props.zoom}
          onChange={(changeObject) => {
              this.setState({
                  zoom: changeObject.zoom,
                  boundary: changeObject.bounds,
              });
          }}
          yesIWantToUseGoogleMapApiInternals
          onGoogleApiLoaded={({ map, maps }) => {
              // AJAX
              // 1. call backend API to get data (XHR)
              MapServices.getUSCovidData()
              .then(response => {
                // data handling in JS
                const covidDataPoints = MapUtils.getCovidPoints(response.data);
                // 2. setState to trigger updating (re render)
                this.setState({points: covidDataPoints});
                console.log(this.state);
              })
              .catch(error => console.log(error));            
          }}
        >
          {this.renderPoints()}
        </GoogleMapReact>
      </div>
    );
  }

  renderPoints() {
    const points = this.state.points[this.state.zoom];
    const result = [];
    if(!points) {
      return result;
    }
    // render counties
    if(Array.isArray(points)) {
      for (const county of points) {
        // is point in bounday?
        if(!MapUtils.isInBoundary(this.state.boundary, county.coordinates)) {
          continue;
        }
        result.push(
          <PointMarker
            lat={county.coordinates.latitude}
            lng={county.coordinates.longitude}
            key={`${county.country}-${county.province}-${county.county}`}
          >
            <CountyCard {...county}/>
          </PointMarker>
        );
      }
    }

    // render states
    if(points.type === "state") {
      for(const nation in points) {
        for(const state in points[nation]) {
          // is state in boundary?
          if(!MapUtils.isInBoundary(this.state.boundary, points[nation][state].coordinates)) {
            continue;
          }
          result.push(
            <PointMarker
            lat={points[nation][state].coordinates.latitude}
            lng={points[nation][state].coordinates.longitude}
            key={`${nation}-${state}`}
          >
            <StateCard state={state} {...points[nation][state]}/>
          </PointMarker>
          );
        }
      }
    }
    return result;
  }
}
export default Map;