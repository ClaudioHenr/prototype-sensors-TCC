import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, FlatList } from 'react-native';
import { Accelerometer, Gyroscope } from 'expo-sensors';
import axios from 'axios';

export default function GetDataSensors() {
    const [sensorData, setSensorData] = useState({
        accelerometer: [],
        gyroscope: [],
    });

    const [collecting, setCollecting] = useState(false);

    useEffect(() => {
        if (collecting) {
            Accelerometer.setUpdateInterval(1000); // 1 second
            Gyroscope.setUpdateInterval(1000); // 1 second

            const accelerometerSubscription = Accelerometer.addListener(accelerometerData => {
                setSensorData(prevData => ({
                    ...prevData,
                    accelerometer: [...prevData.accelerometer, accelerometerData],
                }));
            });

            const gyroscopeSubscription = Gyroscope.addListener(gyroscopeData => {
                setSensorData(prevData => ({
                    ...prevData,
                    gyroscope: [...prevData.gyroscope, gyroscopeData],
                }));
            });

            // Stop collecting after 10 seconds
            const timer = setTimeout(() => {
                accelerometerSubscription.remove();
                gyroscopeSubscription.remove();
                setCollecting(false);
            }, 10000);

            return () => {
                accelerometerSubscription.remove();
                gyroscopeSubscription.remove();
                clearTimeout(timer);
            };
        }
    }, [collecting]);

    const startCollecting = () => {
        setSensorData({ accelerometer: [], gyroscope: [] });
        setCollecting(true);
    };

    const sendDataToServer = () => {
        const data = {
            realizado: new Date().toISOString(),
            accelerometer: sensorData.accelerometer,
            gyroscope: sensorData.gyroscope,
        };

        // const serverUrl = 'http://192.168.1.36:3000/create';
        // const serverUrl = 'http://172.16.0.115:3000/create';
        const serverUrl = process.env.URL_CREATE;

        axios.post(serverUrl, data, {
            headers: {
                'Content-Type': 'application/json',
            },
        })
        .then(response => {
            console.log('Data sent to server successfully:', response.data);
        })
        .catch(error => {
            if (error.response) {
                // Server responded with a status other than 200 range
                console.log('error.response.data', error.response.data);
                console.log('error.response.status', error.response.status);
                console.log('error.response.headers', error.response.headers);
              } else if (error.request) {
                // Request was made but no response was received
                console.log('error.request', error.request);
              } else {
                // Error occurred in setting up the request
                console.error("Error", error.message);
              }
        });
    };

    return (
        <View style={styles.container}>
        <Text>Data Collection Status: {collecting ? "Collecting..." : "Stopped"}</Text>

        <Button title="Start Collecting Data" onPress={startCollecting} />
        <Button title="Send Data to Server" onPress={sendDataToServer} disabled={collecting || sensorData.accelerometer.length === 0} />

        <Text style={styles.heading}>Accelerometer Data:</Text>
        <FlatList
            data={sensorData.accelerometer}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
                <Text>X: {item.x.toFixed(2)} Y: {item.y.toFixed(2)} Z: {item.z.toFixed(2)}</Text>
            )}
        />

        <Text style={styles.heading}>Gyroscope Data:</Text>
        <FlatList
            data={sensorData.gyroscope}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
                <Text>X: {item.x.toFixed(2)} Y: {item.y.toFixed(2)} Z: {item.z.toFixed(2)}</Text>
            )}
        />
    </View>
    );
};
// export default function GetDataSensors() {
//     const [accelerometerData, setAccelerometerData] = useState({ x: 0, y: 0, z: 0, ...});
//     const [gyroscopeData, setGyroscopeData] = useState({ x: 0, y: 0, z: 0 });
    
//     useEffect(() => {
//         // Subscribe to accelerometer data
//         const accelerometerSubscription = Accelerometer.addListener(accelerometerData => {
//             setAccelerometerData(accelerometerData);
//             Accelerometer.setUpdateInterval(1000);
//         });

//         // Subscribe to gyroscope data
//         const gyroscopeSubscription = Gyroscope.addListener(gyroscopeData => {
//             setGyroscopeData(gyroscopeData);
//             Gyroscope.setUpdateInterval(1000);
//         });

//         // Return cleanup functions to unsubscribe from sensors
//         return () => {
//             accelerometerSubscription.remove();
//             gyroscopeSubscription.remove();
//         };
//     }, []);

//     const testServer = () => {
//         axios.get('http://172.16.0.115:3000/')
//         .then(
//             console.log('GET successfull')
//         )
//         .catch(error => {
//             if (error.response) {
//                 // Server responded with a status other than 200 range
//                 console.log('error.response.data', error.response.data);
//                 console.log('error.response.status', error.response.status);
//                 console.log('error.response.headers', error.response.headers);
//               } else if (error.request) {
//                 // Request was made but no response was received
//                 console.log('error.request', error.request);
//               } else {
//                 // Error occurred in setting up the request
//                 console.error("Error", error.message);
//               }
//         })
//     }

//     const sendDataToServer = () => {
//         const data = {
//             realizado: new Date().toISOString(),
//             // accelerometer: accelerometerData,
//             // gyroscope: gyroscopeData,
//             x_axis: accelerometerData.x,
//             y_axis: accelerometerData.y,
//             z_axis: accelerometerData.z
//         };
    
//         axios.post('http://172.16.0.115:3000/create', data, console.log('Mandando para o server...'), {
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//         })
//         .then(response => {
//             console.log('Data sent to server successfully:', response.data);
//         })
//         .catch(error => {
//             console.error('Error sending data to server:', error);
//         });
//     };

//     return (
//         <View style={styles.container}>
//             <Text>Accelerometer:</Text>
//             <Text>X: {accelerometerData.x.toFixed(6)}</Text>
//             <Text>Y: {accelerometerData.y.toFixed(6)}</Text>
//             <Text>Z: {accelerometerData.z.toFixed(6)}</Text>

//             <Text>Gyroscope:</Text>
//             <Text>X: {gyroscopeData.x.toFixed(6)}</Text>
//             <Text>Y: {gyroscopeData.y.toFixed(6)}</Text>
//             <Text>Z: {gyroscopeData.z.toFixed(6)}</Text>

//             <Button title="Send Data to Server" onPress={sendDataToServer} />
//             <Button title="Test Server" onPress={testServer} />
//         </View>
//     );
// };

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    heading: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 16,
    },
});
