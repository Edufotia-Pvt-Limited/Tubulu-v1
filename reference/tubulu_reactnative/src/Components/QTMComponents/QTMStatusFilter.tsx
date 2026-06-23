import React, {useEffect, useState} from 'react';
import {ScrollView, Text, TouchableOpacity, View} from 'react-native';
import {colors} from '../../Utils/Colors';

interface Props {
  readonly selectedType:
    | 'NONE'
    | 'INPROGRESS'
    | 'COMPLETED'
    | 'CANCELLED'
    | 'OVERDUE'
    | 'DATE_EXTENSION';
  readonly setFilterType: (type: any) => void;
  readonly showExtension?: boolean;
  readonly count: {
    all: number;
    inProgress: number;
    completed: number;
    cancelled: number;
    overdue: number;
    extension?: number;
  };
}

type FilterType = {
  type: string;
  value: string;
  count: number;
};

export function QTMStatusFilter({
  selectedType,
  setFilterType,
  count,
  showExtension = false,
}: Props): JSX.Element {
  const filters: FilterType[] = [
    {
      type: 'All',
      value: 'NONE',
      count: count.all,
    },
    {
      type: 'Extension',
      value: 'DATE_EXTENSION',
      count: count?.extension ?? 0,
    },
    {
      type: 'In Progress',
      value: 'INPROGRESS',
      count: count.inProgress,
    },
    {
      type: 'Completed',
      value: 'COMPLETED',
      count: count.completed,
    },
    {
      type: 'Cancelled',
      value: 'CANCELLED',
      count: count.cancelled,
    },
    {
      type: 'Overdue',
      value: 'OVERDUE',
      count: count.overdue,
    },
  ];

  const [statusFilters, setStatusFilters] = useState<FilterType[]>(
    filters?.filter(fItem => fItem.value !== 'DATE_EXTENSION'),
  );

  useEffect(() => {
    if (showExtension) {
      setStatusFilters(filters);
    } else {
      setStatusFilters(
        filters?.filter(fItem => fItem.value !== 'DATE_EXTENSION'),
      );
    }
  }, [showExtension, count]);

  return (
    <ScrollView
      horizontal
      style={{
        flexDirection: 'row',
        marginHorizontal: 15,
      }}>
      {statusFilters.map((filter, index) => (
        <TouchableOpacity
          key={index}
          activeOpacity={1}
          onPress={() => {
            setFilterType(filter.value);
          }}>
          <View
            style={{
              borderRadius: 8,
              elevation: 4,
              shadowColor: 'rgba(0, 0, 0, 0.8)',
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.2,
              shadowRadius: 3.84,
              borderColor:
                selectedType == filter.value
                  ? colors.backgroundColorHeader
                  : '#D9D9D9',
              borderWidth:
                selectedType == filter.value
                  ? selectedType !== 'NONE'
                    ? 0
                    : 0.54
                  : 0.54,
              backgroundColor:
                selectedType == filter.value
                  ? selectedType == 'OVERDUE'
                    ? colors.cancelledRed
                    : selectedType == 'COMPLETED'
                    ? colors.completedGreen
                    : selectedType == 'INPROGRESS'
                    ? colors.inProgressYellow
                    : selectedType == 'CANCELLED'
                    ? colors.cancelledRed
                    : colors.backgroundColorHeader
                  : colors.backgroundWhite,
              justifyContent: 'center',
              alignItems: 'center',
              height: 26,
              width: 110,
              margin: 5,
            }}>
            <Text
              allowFontScaling={false}
              style={{
                fontSize: 13,
                fontWeight: '400',
                color:
                  selectedType == filter.value
                    ? colors.backgroundWhite
                    : colors.titleBlackColor,
              }}>
              {filter.type}{' '}
              {`(${filter.count < 10 ? `0${filter.count}` : filter.count})`}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
