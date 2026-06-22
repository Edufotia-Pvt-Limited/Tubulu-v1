import moment from 'moment';
import {IQTMTasksv2} from '../models/IQTM';
import {allowedMimeTypes} from './Constants';
import {getPercentage} from './Helper';

export async function getCategorizedTasks(tasks: IQTMTasksv2[]) {
  return tasks?.reduce(
    (
      acc: {
        pinnedOverdue: IQTMTasksv2[];
        overdue: IQTMTasksv2[];
        pinned: IQTMTasksv2[];
        other: IQTMTasksv2[];
        cancelled: IQTMTasksv2[];
        completed: IQTMTasksv2[];
      },
      task,
    ) => {
      if (task?.dueSubTasks && task?.isPinned) {
        acc.pinnedOverdue.push(task);
      } else if (task?.dueSubTasks) {
        acc.overdue.push(task);
      } else if (task?.isPinned) {
        acc.pinned.push(task);
      } else if (task?.wattages?.cancelled) {
        acc.cancelled.push(task);
      } else if (getPercentage(task?.wattages) === 100) {
        acc.completed.push(task);
      } else {
        acc.other.push(task);
      }
      return acc;
    },
    {
      pinnedOverdue: [],
      overdue: [],
      pinned: [],
      other: [],
      cancelled: [],
      completed: [],
    },
  );
}

export function getStatus(dueSubTasks: number | undefined, wattages: any) {
  const percentage = getPercentage(wattages);
  if (percentage === 100) {
    return 'Completed';
  }
  // if (getCancelledPercentage(wattages) == 100) {
  //   return 'Cancelled';
  // }
  if (dueSubTasks! > 0) {
    return 'Overdue';
  }
  return 'Low';
}

export function getCancelledPercentage(wattage: any) {
  if (typeof wattage === 'object') {
    const sum = wattage?.inProgress + wattage?.completed + wattage?.cancelled;
    const percentage = Math.floor((wattage?.cancelled / sum) * 100);
    return percentage;
  }
  return 0;
}

export function QTMFormattedTime(time: string, needAmPmSmall?: boolean) {
  const _time = new Date(time);
  const hour = _time.getHours();
  const _hour =
    hour > 12
      ? hour - 12 < 10
        ? `0${hour - 12}`
        : hour.toString()
      : hour < 10
      ? `0${hour}`
      : hour.toString();
  const minutes = _time.getMinutes();
  const _minutes = minutes < 10 ? `0${minutes}` : minutes.toString();
  const timeString = _hour + ':' + _minutes + (hour > 12 ? ' PM' : ' AM');
  if (needAmPmSmall) {
    return _hour + ':' + _minutes + (hour > 12 ? 'pm' : 'am');
  }
  return timeString;
}

export function QTMFormattedDateV5(date: string) {
  const _date = new Date(date);
  const formattedDate = moment(_date).format('DD/MM/YYYY');
  return formattedDate;
}

export function CheckDocumentMimeTypes(mimeType: string) {
  return allowedMimeTypes.includes(mimeType);
}

export function DocumentType(mimeType: string): string {
  switch (mimeType) {
    case 'text/plain':
      return 'Text';
    case 'text/html':
      return 'HTML';
    case 'application/rtf':
      return 'RTF';
    case 'text/markdown':
      return 'Markdown';
    case 'application/xml':
      return 'XML';
    case 'text/csv':
      return 'CSV';
    case 'application/doc':
      return 'DOC';
    case 'application/msword':
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return 'Word';
    case 'application/vnd.ms-excel':
    case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
      return 'Excel';
    case 'application/vnd.ms-powerpoint':
    case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
      return 'PPT';
    case 'application/pdf':
      return 'PDF';
    case 'application/postscript':
      return 'PostScript';
    case 'application/zip':
      return 'ZIP';
    case 'application/gzip':
      return 'GZIP';
    default:
      return 'DOC';
  }
}
