import React, {useEffect, useState} from 'react';
import {Text, View} from 'react-native';
import {PieChart} from 'react-native-chart-kit';
import {QTMChartData} from '../../models/IQTM';

interface QTMPieChartProps {
  readonly data: QTMChartData[];
  readonly size?: 70 | 90;
}

export function QTMPieChart({data, size = 70}: QTMPieChartProps): React.ReactElement {
  const [pieData, setPieData] = useState<QTMChartData[]>([]);
  const [percentage, setPercentage] = useState<number>(0);

  useEffect(() => {
    buildPieData(data);
    getPercentage(data);
  }, [data]);

  const buildPieData = (data: QTMChartData[]) => {
    let _data: QTMChartData[] = Object.assign([], data);
    let _resultData: QTMChartData[] = [];
    if (typeof data === 'object' && data.length > 0) {
      if (
        (_data[0].value == 0 && _data[1].value == 0 && _data[2].value == 0) ||
        (_data[0].value == undefined &&
          _data[1].value == undefined &&
          _data[2].value == undefined)
      ) {
        let newData: any[] = [];
        _data.forEach(chart => {
          newData.push({
            name: chart.name || '',
            value: 100,
            color: '#D9D9D9',
          });
        });
        setPieData(newData);
      } else {
        _data.map((dataItem: QTMChartData) => {
          _resultData.push({
            name: dataItem.name || '',
            value: dataItem.value || 0,
            color: dataItem.color || '',
          });
        });
        setPieData(_resultData);
      }
    }
  };

  const getPercentage = (data: QTMChartData[]): number => {
    const closedValue = data?.find(chart => chart.name == 'Completed');
    const allVal = data?.map(chart => chart.value);
    if (closedValue?.value) {
      const sum = allVal[0] + allVal[1] + allVal[2];
      const percentage = Math.floor((closedValue?.value / sum) * 100);
      setPercentage(percentage);
      return percentage;
    }
    setPercentage(0);
    return 0;
  };

  return (
    <View
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        height: 74,
        width: 74,
      }}>
      <PieChart
        backgroundColor="transparent"
        accessor="value"
        width={size}
        height={size}
        hasLegend={false}
        data={pieData}
        paddingLeft={size == 70 ? '18' : '22'}
        chartConfig={{
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          backgroundColor: '#FFFFFF',
        }}
        style={{
          transform: [{rotate: '100deg'}],
        }}
      />
      <View
        style={{
          position: 'absolute',
          height: size / 2 - 3,
          width: size / 2 - 3,
          backgroundColor: 'white',
          borderRadius: 100,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        {pieData?.length > 0 && (
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            allowFontScaling={false}
            style={{
              color: '#8A8A8E',
              fontSize: size == 90 ? 12 : 10,
              fontWeight: '400',
              maxWidth: 40,
            }}>
            {percentage}%
          </Text>
        )}
      </View>
    </View>
  );
}
