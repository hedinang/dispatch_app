import React, {Component} from "react";
import styles from "./styles";
import { AxlPanel } from "axl-reactjs-ui";

export default class ShipmentDropoffWhat3WordsInfo extends Component {
  getWhat3WordsJSX = (styles,shipment) => {
    const { showLink } = this.props;
    return (

        <div style={styles.what3WordsContent}>
          {shipment.dropoff_what3words ?
              !!showLink ?
                  <a target="_blank"
                     href={`https://what3words.com/${shipment.dropoff_what3words}`}>
                    {shipment.dropoff_what3words}
                  </a> :
                  <div>{shipment.dropoff_what3words}</div>
              : '-'}
        </div>
    );
  }

  render(){
    const { shipment } = this.props;
    return (
        <AxlPanel.Row>
          <AxlPanel.Col>
            <AxlPanel.Row style={styles.what3WordsWindow}>
              <AxlPanel.Col>
                <AxlPanel.Row>
                  <span style={styles.what3WordsLabel}>{`What3Words Address: `}</span>
                  <span>{this.getWhat3WordsJSX(styles,shipment)}</span>
                </AxlPanel.Row>
              </AxlPanel.Col>
            </AxlPanel.Row>
          </AxlPanel.Col>
        </AxlPanel.Row>
    );
  }
}