// Utility functions to overcome Sequelize's flaws
// Useful for lazy loading approach

const graftValues = (array1, array1Key, array2, array2Key, array2Value, defaultValue) => {
  const array2Indexed = array2.reduce( (dict, curVal) => {
    dict[curVal.dataValues[array2Key]] = curVal.dataValues[array2Value];
    return dict;
  } , {});
  const array1Grafted = array1.map( ele => {
    console.log(array2Value, ele, ele[array2Value], ele[array2Key]);
    ele[array2Value] = array2Indexed[ele[array1Key]] ? array2Indexed[ele[array1Key]] : defaultValue;
    return ele;
  })
  return array1Grafted;
};

const findAllResultToArray = (findAllResult) => findAllResult.map( ele => ele.dataValues );

module.exports = {
  graftValues,
  findAllResultToArray
};
