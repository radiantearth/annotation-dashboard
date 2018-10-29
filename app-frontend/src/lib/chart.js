function parseChartData(results) {
  var labels = []
  var data = []
  var count = 0;

  results.forEach(result => {
    var date = result.date.split(' ');
    var parseDate = date[1] + date[2];

    labels.push(parseDate);
    data.push(result.count);
    count += result.count;

  });

  return {labels, data, count};
}

function getViewedChart(results) {
  let {labels, data, count} = parseChartData(results);
  var chart = {
    labels,
    datasets: [
      {
        label: 'Viewed',
        fill: true,
        backgroundColor: 'rgba(0,191,255,1)',
        borderColor: 'rgba(0,191,255,0.4)',
        pointRadius: 2,
        pointHitRadius: 3,
        data
      }
    ]
  }
  return {chart, count};
}

function getDownloadedChart(results) {
  let {labels, data, count} = parseChartData(results);
  var chart = {
    labels,
    datasets: [
      {
        label: 'Downloaded',
        fill: true,
        backgroundColor: 'rgba(75,192,192,1)',
        borderColor: 'rgba(75,192,192,0.4)',
        pointRadius: 2,
        pointHitRadius: 3,
        data
      }
    ]
  }
  return {chart, count};
}

function getUploadedChart(results) {
  let {labels, data, count} = parseChartData(results);
  var chart = {
    labels,
    datasets: [
      {
        label: 'Uploaded',
        fill: true,
        backgroundColor: 'rgba(255,127,80,1)',
        borderColor: 'rgba(255,127,80,0.4)',
        pointRadius: 2,
        pointHitRadius: 3,
        data
      }
    ]
  }
  return {chart, count};
}

function getAnalyzedChart(results) {
  let {labels, data, count} = parseChartData(results);
  var chart = {
    labels,
    datasets: [
      {
        label: 'Analyzed',
        fill: true,
        backgroundColor: 'rgba(147,112,219,1)',
        borderColor: 'rgba(147,112,219,0.4)',
        pointRadius: 2,
        pointHitRadius: 3,
        data
      }
    ]
  }
  return {chart, count};
}

function getVerifiedOrgsCount(results) {
  var count = 0;
    results.forEach(result => {
    if (result.verified) {
      count += 1;
    }
  });
  return count;
}

function getUserEventCount(results) {
  var count = 0;

  results.forEach(result => {
    count += result.count;
  });

  return count;
}

function getUserChartData(results) {
  var labels = []
  var data = []

  results.forEach(result => {
    labels.push(result.userId);
    data.push(result.count);
  });

  const userData = {
    labels,
    datasets: [
      {
        label: 'User Activity',
        backgroundColor: 'rgba(0,191,255,1)',
        borderColor: 'rgba(0,191,255,.2)',
        borderWidth: 1,
        hoverBackgroundColor: 'rgba(0,122,163,1)',
        hoverBorderColor: 'rgba(0,122,163,.2)',
        pointRadius: 2,
        pointHitRadius: 3,
        data
      }
    ]
  };
  return userData;
}

// have multiple action get's

const CHART = {
  getViewedChart,
  getDownloadedChart,
  getUploadedChart,
  getAnalyzedChart,
  getVerifiedOrgsCount,
  getUserEventCount,
  getUserChartData
}
export default CHART
