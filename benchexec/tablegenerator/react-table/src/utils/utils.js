// This file is part of BenchExec, a framework for reliable benchmarking:
// https://github.com/sosy-lab/benchexec
//
// SPDX-FileCopyrightText: 2019-2020 Dirk Beyer <https://www.sosy-lab.org>
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import copy from "copy-to-clipboard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy } from "@fortawesome/free-regular-svg-icons";

/* A DOM node that allows its content to be copied to the clipboard. */
export class CopyableNode extends React.Component {
  constructor(props) {
    super(props);
    this.childRef = React.createRef();
  }

  render() {
    return (
      <>
        <span ref={this.childRef}>{this.props.children}</span>
        <button
          title="Copy to clipboard"
          style={{ margin: "1ex" }}
          onClick={() => {
            copy(this.childRef.current.innerText, { format: "text/plain" });
          }}
        >
          <FontAwesomeIcon icon={faCopy} />
        </button>
      </>
    );
  }
}

/*
 * Split the path of a URL into a prefix (that is the longest prefix that is
 * shared with a second given URL) and the rest.
 * Both given URLs can be URL or Location instances.
 * Returns [prefix, rest] as an array of strings.
 * The "rest" always conains a least the file-part of the first URL
 * (after the last slash).
 * Protocol, query part and hash of the URL is dropped.
 */
export const splitUrlPathForMatchingPrefix = (url1, url2) => {
  const path1 = url1.pathname.split("/");
  const path2 = url2.pathname.split("/");
  const firstDiffering = path1.findIndex(
    (element, index) => element !== path2[index],
  );
  return [
    path1.slice(0, firstDiffering).join("/"),
    path1.slice(firstDiffering).join("/"),
  ];
};

const emptyStateValue = "##########";

const prepareTableData = ({ head, tools, rows, stats, props, initial }) => {
  return {
    tableHeader: head,
    taskIdNames: head.task_id_names,
    tools: tools.map((tool, idx) => ({
      ...tool,
      toolIdx: idx,
      columns: tool.columns.map((column, idx) => ({
        ...column,
        colIdx: idx,
      })),
      scoreBased: rows.every((row) => row.results[idx].score !== undefined),
    })),
    columns: tools.map((tool) => tool.columns.map((column) => column.title)),
    tableData: rows,
    stats: stats,
    properties: props,
    initial: initial,
  };
};

const isNumericColumn = (column) =>
  column.type === "count" || column.type === "measure";

const isNil = (data) => data === undefined || data === null;

const getRawOrDefault = (value, def) =>
  isNil(value) || isNil(value.raw) ? def : value.raw;

const numericSortMethod = (a, b) => {
  const aValue = getRawOrDefault(a, +Infinity);
  const bValue = getRawOrDefault(b, +Infinity);
  return aValue - bValue;
};

const textSortMethod = (a, b) => {
  const aValue = getRawOrDefault(a, "").toLowerCase();
  const bValue = getRawOrDefault(b, "").toLowerCase();
  if (aValue === "") {
    return 1;
  }
  if (bValue === "") {
    return -1;
  }
  return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
};

const isOkStatus = (status) => {
  return status === 0 || status === 200;
};

const omit = (keys, data) => {
  const newKeys = Object.keys(data).filter((key) => !keys.includes(key));
  return newKeys.reduce((acc, key) => {
    acc[key] = data[key];
    return acc;
  }, {});
};

const without = (value, array) => {
  const out = [];
  for (const item of array) {
    if (item !== value) {
      out.push(item);
    }
  }
  return out;
};

// Best-effort attempt for calculating a meaningful column width
const determineColumnWidth = (column, min_width, max_width) => {
  let width = column.max_width; // number of chars in column
  if (min_width) {
    width = Math.max(width, min_width);
  }
  if (max_width) {
    width = Math.min(width, max_width);
  }
  if (!width) {
    width = 10;
  }

  return width * 8 + 20;
};

const path = (pathArr, data) => {
  let last = data;
  for (const p of pathArr) {
    last = last[p];
    if (isNil(last)) {
      return undefined;
    }
  }
  return last;
};

const pathOr = (pathArr, fallback, data) => {
  const pathRes = path(pathArr, data);

  return pathRes === undefined ? fallback : pathRes;
};

const formatColumnTitle = (column) =>
  column.unit ? (
    <>
      {column.display_title}
      <br />
      {`(${column.unit})`}
    </>
  ) : (
    column.display_title
  );

const getRunSetName = ({ tool, date, niceName }) => {
  return `${tool} ${date} ${niceName}`;
};

// Extended color list copied from
// https://github.com/uber/react-vis/blob/712ea622cf12f17bcc38bd6143fe6d22d530cbce/src/theme.js#L29-L51
// as advised in https://github.com/uber/react-vis/issues/872#issuecomment-404915958
const EXTENDED_DISCRETE_COLOR_RANGE = [
  "#19CDD7",
  "#DDB27C",
  "#88572C",
  "#FF991F",
  "#F15C17",
  "#223F9A",
  "#DA70BF",
  "#125C77",
  "#4DC19C",
  "#776E57",
  "#12939A",
  "#17B8BE",
  "#F6D18A",
  "#B7885E",
  "#FFCB99",
  "#F89570",
  "#829AE3",
  "#E79FD5",
  "#1E96BE",
  "#89DAC1",
  "#B3AD9E",
];

/**
 *
 * @param {String} [str]
 */
const getHashSearch = (str) => {
  const urlParts = (str || decodeURI(document.location.href)).split("?");
  const search = urlParts.length > 1 ? urlParts.slice(1).join("?") : undefined;
  if (search === undefined || search.length === 0) {
    return {};
  }
  const keyValuePairs = search.split("&").map((i) => i.split("="));

  const out = {};
  for (const [key, ...value] of keyValuePairs) {
    out[key] = value.join("=");
  }
  return out;
};

/**
 *
 * @param {Object} params Object containing the params to be encoded as query params
 * @param {Boolean} [returnString] if true, only returns the url without setting it
 */
const setHashSearch = (
  params = {},
  options = {
    returnString: false,
    baseUrl: null,
    keepOthers: false,
    paramName: null,
    history: null,
  },
) => {
  let additionalParams = {};
  let transformedParams = params;
  if (options.keepOthers) {
    additionalParams = getHashSearch();
    const removedItems = Object.entries(params).filter(
      ([_, value]) => value === undefined || value === null,
    );
    removedItems.forEach(([key]) => {
      delete additionalParams[key];
      delete transformedParams[key];
    });
  }
  const mergedParams = { ...additionalParams, ...params };
  const optionTemplate = { returnString: false, baseUrl: null };
  const { returnString, baseUrl, history } = { ...optionTemplate, ...options };
  const url = (baseUrl || document.location.href).split("?")[0];
  const pairs = Object.keys(mergedParams).map(
    (key) => `${key}=${mergedParams[key]}`,
  );
  const searchString = `?${pairs.join("&")}`;
  const hrefString = encodeURI(`${url}${searchString}`);
  if (returnString) {
    return hrefString;
  }
  if (history) {
    history.push(searchString);
    return;
  }
  document.location.href = hrefString;
};

const makeUrlFilterDeserializer = (statusValues, categoryValues) => {
  const deserializer = makeFilterDeserializer({ categoryValues, statusValues });
  return (str) => {
    const params = getHashSearch(str);
    if (params.filter) {
      return deserializer(params.filter);
    }
    return null;
  };
};

const makeSerializedFilterValue = (filter) => {
  const parts = [];
  for (const [key, values] of Object.entries(filter)) {
    parts.push(`${key}(${values.map(escape).join(",")})`);
  }
  return parts.join(",");
};
const createDistinctValueFilters = (selected, nominal, trim = false) => {
  const filter = {};
  // we want to minimize the needed space to encode the filter
  // if we have more than half of all values selected, we encode all not selected
  // values in "notIn", otherwise we encode all selected values in "in"
  if (selected.length > Math.floor(nominal.length / 2.0)) {
    const exclusions = [];
    for (const status of nominal) {
      if (!selected.includes(status)) {
        exclusions.push(trim ? status.trim() : status);
      }
    }
    filter.notIn = exclusions;
  } else {
    filter.in = selected.map((val) => (trim ? val.trim() : val));
  }
  return makeSerializedFilterValue(filter);
};

function makeStatusColumnFilter(
  filters,
  allStatusValues,
  tool,
  columnId,
  allCategoryValues,
) {
  const statusColumnFilter = [];
  const { statusValues, categoryValues } = filters;
  const toolStatusValues = allStatusValues[tool][columnId];
  const toolCategoryValues = allCategoryValues[tool][columnId];

  const hasStatusFilter = !!statusValues;
  const hasStatusUnchecked =
    hasStatusFilter && statusValues.length !== toolStatusValues.length;

  const hasCategoryFilter = !!categoryValues;
  const hasCategoryUnchecked =
    hasCategoryFilter && categoryValues.length !== toolCategoryValues.length;

  if (hasStatusFilter) {
    if (hasStatusUnchecked) {
      const encodedFilter = createDistinctValueFilters(
        statusValues,
        toolStatusValues,
      );
      statusColumnFilter.push(`status(${encodedFilter})`);
    }
    if (!hasCategoryFilter) {
      statusColumnFilter.push("category(empty())");
    }
  }
  if (hasCategoryFilter) {
    if (!hasStatusFilter) {
      statusColumnFilter.push("status(empty())");
    }
    if (hasCategoryUnchecked) {
      const encodedFilter = createDistinctValueFilters(
        categoryValues,
        toolCategoryValues,
        true,
      );
      statusColumnFilter.push(`category(${encodedFilter})`);
    }
  }
  return statusColumnFilter.join(",");
}

const makeFilterSerializer =
  ({ statusValues: allStatusValues, categoryValues: allCategoryValues }) =>
  (filter) => {
    const groupedFilters = {};
    const tableTabIdFilters = [];
    for (const { id, value, values, isTableTabFilter } of filter) {
      if (id === "id") {
        if (values && values.length > 0) {
          groupedFilters.ids = {
            values: values.map((val) => (val ? val : "")),
          };
        } else if (isTableTabFilter) {
          tableTabIdFilters.push({ id, value });
        }
        continue;
      }
      const [tool, name, column] = id.split("_");
      const toolBucket = groupedFilters[tool] || {};
      const columnBucket = toolBucket[column] || { name: escape(name) };

      if (allStatusValues[tool][column] || allCategoryValues[tool][column]) {
        // we are processing a status column with checkboxes
        if (value.endsWith(" ")) {
          // category value
          const selectedCategoryValues = columnBucket.categoryValues || [];
          selectedCategoryValues.push(value);
          columnBucket.categoryValues = selectedCategoryValues;
        } else {
          // status value
          const selectedStatusValues = columnBucket.statusValues || [];
          selectedStatusValues.push(value);
          columnBucket.statusValues = selectedStatusValues;
        }
      } else {
        columnBucket.value = value;
      }
      toolBucket[column] = columnBucket;
      groupedFilters[tool] = toolBucket;
    }
    // serialization part
    // we want to transform our filters into the following format:
    // [<idFilter>,]<runsetFilter>+
    // with
    // <idFilter> := id(values(<value>+))
    // <runsetFilter> := <runsetId>(<columnFilter>+)[,]
    // <columnFilter> := <columnId>*<name>*(<filter>)[,]
    // <filter> := <valueFilter>|<statusColumnFilter>
    // <valueFilter> := value(<value>)
    // <statusColumnFilter> := <statusFilter>|<categoryFilter>|<statusFilter>,<categoryFilter>
    // <statusFilter> := status(in(<value>+)|notIn(<value>+)|empty())
    // <categoryFilter> := category(in(<value>+)|notIn(<value>+)|empty())
    // <value> := <urlencodedTerminalValue>

    // one transformed example would be
    // 1(0*status*(statusFilter(notIn(true)),categoryFilter(in(correct,missing))),1*cputime*(value(%3A1120)))

    const { ids, ...rest } = groupedFilters;
    const runsetFilters = [];
    if (ids) {
      runsetFilters.push(`id(values(${ids.values.map(escape).join(",")}))`);
    }
    if (tableTabIdFilters) {
      tableTabIdFilters.forEach((filter) => {
        runsetFilters.push(`id_any(value(${filter.value}))`);
      });
    }
    for (const [tool, column] of Object.entries(rest)) {
      const columnFilters = [];
      for (const [columnId, filters] of Object.entries(column)) {
        const columnFilterHeader = `${columnId}*${filters.name}*`;
        let filter;
        if (filters.statusValues || filters.categoryValues) {
          // <statusColumnFilter>
          filter = makeStatusColumnFilter(
            filters,
            allStatusValues,
            tool,
            columnId,
            allCategoryValues,
          );
        } else {
          // <valueFilter>
          filter = `value(${escape(filters.value)})`;
        }
        if (filter !== "") {
          columnFilters.push(`${columnFilterHeader}(${filter})`);
        }
      }
      if (columnFilters.length > 0) {
        runsetFilters.push(`${tool}(${columnFilters.join(",")})`);
      }
    }
    const filterString = runsetFilters.join(",");
    return filterString;
  };

const tokenizePart = (string) => {
  const out = {};
  let openBrackets = 0;

  let buf = "";

  for (const char of string) {
    // we want to split the filter string on the highest level first
    if (char === "(") {
      buf += char;
      openBrackets++;
      continue;
    }
    if (char === ")") {
      buf += char;
      openBrackets--;
      if (openBrackets === 0) {
        const firstBracket = buf.indexOf("(");
        const key = buf.substr(0, firstBracket);
        const value = buf.substr(
          firstBracket + 1,
          buf.length - 1 - (firstBracket + 1),
        );
        out[key] = value;
      }
      continue;
    }
    if (openBrackets === 0 && char === ",") {
      buf = "";
      continue;
    }
    buf += char;
  }
  return out;
};

const handleStatusColumnFilter = (
  token,
  param,
  statusValues,
  categoryValues,
  column,
) => {
  // "in(a,b,c)"
  const parts = tokenizePart(param);
  const out = [];
  for (const [method, stringItems] of Object.entries(parts)) {
    if (method === "in") {
      let items = stringItems.split(",").map(unescape);
      if (token === "category") {
        items = items.map((item) => `${item} `);
      }
      out.push(...items.map((item) => ({ value: item })));
    }
    if (method === "notIn") {
      let items = stringItems.split(",").map(unescape);
      const itemsToPush = [];
      if (token === "category") {
        items = items.map((item) => `${item} `);

        for (const cat of categoryValues[column]) {
          if (!items.includes(cat)) {
            itemsToPush.push({ value: cat });
          }
        }
      } else {
        for (const stat of statusValues[column]) {
          if (!items.includes(stat)) {
            itemsToPush.push({ value: stat });
          }
        }
      }
      out.push(...itemsToPush);
    }
  }
  return out;
};

const tokenHandlers = (
  token,
  param,
  allStatusValues,
  allCategoryValues,
  column,
) => {
  if (token === "values") {
    // wrapping return in array to allow vararg spreading
    return [{ values: param.split(",").map(unescape) }];
  }
  if (token === "value") {
    return [{ value: unescape(param) }];
  }
  if (token === "status" || token === "category") {
    return handleStatusColumnFilter(
      token,
      param,
      allStatusValues,
      allCategoryValues,
      column,
    );
  }
};

const makeFilterDeserializer =
  ({ categoryValues: allCategoryValues, statusValues: allStatusValues }) =>
  (filterString) => {
    const runsetFilters = tokenizePart(filterString);
    const out = [];
    for (const [token, filter] of Object.entries(runsetFilters)) {
      if (token === "id") {
        const tokenized = tokenizePart(filter);
        out.push({
          id: "id",
          ...tokenHandlers("values", tokenized["values"])[0],
        });
        continue;
      } else if (token === "id_any") {
        out.push({
          id: "id",
          ...tokenizePart(filter),
        });
        continue;
      }
      const runsetId = token;

      const columnFilters = tokenizePart(filter);
      const parsedColumnFilters = {};
      for (const [key, columnFilter] of Object.entries(columnFilters)) {
        const [columnId, columnTitle] = key.split("*");
        const name = `${runsetId}_${unescape(columnTitle)}_${columnId}`;
        const parsedFilters = parsedColumnFilters[name] || [];
        const tokenizedFilter = tokenizePart(columnFilter);

        for (const [filterToken, filterParam] of Object.entries(
          tokenizedFilter,
        )) {
          parsedFilters.push(
            ...tokenHandlers(
              filterToken,
              filterParam,
              allStatusValues[runsetId],
              allCategoryValues[runsetId],
              columnId,
            ),
          );
        }
        let hasStatus = false;
        let hasCategory = false;
        for (const token of Object.keys(tokenizedFilter)) {
          if (token === "status") {
            hasStatus = true;
          } else if (token === "category") {
            hasCategory = true;
          }
        }
        if ((hasStatus && !hasCategory) || (!hasStatus && hasCategory)) {
          // if we only have category or a status filter, it means that no
          // filter has been set for the other. We need to fill up the values
          if (!hasStatus) {
            parsedFilters.push(
              ...allStatusValues[runsetId][columnId].map((status) => ({
                value: status,
              })),
            );
          } else {
            parsedFilters.push(
              ...allCategoryValues[runsetId][columnId].map((category) => ({
                value: category,
              })),
            );
          }
        }
        for (const parsedFilter of parsedFilters) {
          out.push({ id: name, ...parsedFilter });
        }
      }
    }
    return out;
  };

const makeUrlFilterSerializer = (statusValues, categoryValues) => {
  const serializer = makeFilterSerializer({ statusValues, categoryValues });
  return (filter, options) => {
    const previousParams = getHashSearch();
    if (!filter) {
      return setHashSearch(previousParams, options);
    }
    const encoded = serializer(filter);
    if (encoded) {
      return setHashSearch({ ...previousParams, filter: encoded }, options);
    }
    delete previousParams.filter;
    return setHashSearch({ ...previousParams }, options);
  };
};
// Sets the URL parameters to the given string. Assumes that there is currently no hash or URL parameters defined.
const setConstantHashSearch = (paramString) => {
  document.location.href = encodeURI(
    `${document.location.href}#${paramString}`,
  );
};

/**
 * Adds or update given key-value pairs to the query params
 *
 * @param {Object} param The Key-Value pair to be added to the current query param list
 */
const setParam = (param) => {
  setHashSearch({ ...getHashSearch(), ...param });
};

const stringAsBoolean = (str) => str === "true";

const deepEquals = (a, b) => {
  for (const key in a) {
    if (typeof a[key] === "function" && typeof b[key] === "function") {
      continue;
    }
    if (typeof a[key] !== typeof b[key]) {
      return false;
    } else if (Array.isArray(a[key]) || typeof a[key] === "object") {
      if (!deepEquals(a[key], b[key])) {
        return false;
      }
    } else {
      if (a[key] !== b[key]) {
        console.log(`${a[key]} !== ${b[key]}`);
        return false;
      }
    }
  }
  return true;
};

/**
 * Function to extract the names of the task id parts and to provide a mapping for filtering.
 * The returned array is of following form:
 * [
 *  {
 *    label: "example",
 *  }, {...}
 * ]
 *
 * where the label will be displayed over the input field of the task id filter and
 * the example value will be the input hint to further clarify the functionality.
 *
 * @param {*} rows - the rows array of the dataset
 */
const getTaskIdParts = (rows, taskIdNames) =>
  pathOr(["0", "id"], [], rows).reduce(
    (acc, curr, idx) => ({ ...acc, [taskIdNames[idx]]: curr }),
    {},
  );

const punctuationSpaceHtml = "&#x2008;";
const characterSpaceHtml = "&#x2007;";

/**
 * Builds and configures a formatting function that can format a number based on
 * the significant digits of the dataset for its column.
 * If whitespaceFormat in the returned function is set to true, the number will be
 * whitespace formatted as described on Page 24 in
 * https://www.sosy-lab.org/research/pub/2019-STTT.Reliable_Benchmarking_Requirements_and_Solutions.pdf
 *
 * @param {Number} significantDigits - Number of significant digits for this column
 */
class NumberFormatterBuilder {
  constructor(significantDigits) {
    this.significantDigits = significantDigits;
    this.maxPositiveDecimalPosition = -1;
    this.maxNegativeDecimalPosition = -1;
  }

  _defaultOptions = { whitespaceFormat: false, html: false };

  addDataItem(item) {
    const [positive, negative] = item.split(/\.|,/);
    this.maxPositiveDecimalPosition = Math.max(
      this.maxPositiveDecimalPosition,
      positive ? positive.length : 0,
    );
    this.maxNegativeDecimalPosition = Math.max(
      this.maxNegativeDecimalPosition,
      negative ? negative.length : 0,
    );
  }

  build() {
    return (number, options = {}) => {
      if (isNil(this.significantDigits)) {
        return number.toString();
      }
      const { whitespaceFormat, html } = {
        ...this._defaultOptions,
        ...options,
      };
      const stringNumber = number.toString();
      let prefix = "";
      let postfix = "";
      let pointer = 0;
      let addedNums = 0;
      let firstNonZero = false;
      let decimal = false;
      const decimalPos = stringNumber.replace(/,/, ".").indexOf(".");
      while (
        addedNums < this.significantDigits - 1 &&
        stringNumber.length > pointer
      ) {
        const current = stringNumber[pointer];
        if (current === "." || current === ",") {
          prefix += ".";
          decimal = true;
        } else {
          if (!firstNonZero) {
            if (current === "0") {
              pointer += 1;
              if (decimal) {
                prefix += current;
              }
              continue;
            }
            firstNonZero = true;
          }
          prefix += current;
          addedNums += 1;
        }
        pointer += 1;
      }
      if (prefix[0] === ".") {
        prefix = `0${prefix}`;
      }
      postfix = stringNumber.substring(pointer);

      if (postfix) {
        // hacky trickery
        // we force the postfix to turn into a decimal value with one leading integer
        // e.g. 5432 -> 5.432
        // this way we can round up to the first digit of the string
        const attachDecimal = postfix[0] === ".";
        postfix = postfix.replace(/\./, "");
        postfix = `${postfix[0]}.${postfix.substr(1)}`;
        postfix = Math.round(Number(postfix));
        postfix = isNaN(postfix) ? "" : postfix.toString();
        if (attachDecimal) {
          postfix = `.${postfix}`;
        }
        // fill up integer number;
        let end = decimalPos;
        if (decimalPos === -1) {
          end = stringNumber.length;
        }
        while (prefix.length + postfix.length < end) {
          postfix += "0";
        }
      }

      const out = `${prefix}${postfix}`;
      if (whitespaceFormat) {
        const decSpace = html ? punctuationSpaceHtml : " ";
        let [integer, decimal] = out.split(/\.|,/);
        if (integer === "0") {
          integer = "";
        }
        integer = integer || "";
        decimal = decimal || "";
        const decimalPoint = decimal ? "." : decSpace;
        while (integer.length < this.maxPositiveDecimalPosition) {
          integer = ` ${integer}`;
        }
        while (decimal.length < this.maxNegativeDecimalPosition) {
          decimal += " ";
        }
        if (html) {
          integer = integer.replace(/ /g, characterSpaceHtml);
          decimal = decimal.replace(/ /g, characterSpaceHtml);
        }
        return `${integer}${decimalPoint}${decimal}`;
      }
      return out;
    };
  }
}
/**
 * Creates an object with an entry for each of the tools, identified by the index of the tool, that stores the hidden columns defined in the URL.
 * Each property contains an array of integers which represent the indexes of the columns of the corresponding runset that will be hidden.
 */
const createHiddenColsFromURL = (tools) => {
  const urlParams = getHashSearch();
  // Object containing all hidden runsets from the URL (= param "hidden")
  let hiddenTools = [];
  if (urlParams.hidden) {
    hiddenTools = urlParams.hidden
      .split(",")
      .filter(
        (hiddenTool) =>
          Number.isInteger(parseInt(hiddenTool)) &&
          tools.some((tool) => tool.toolIdx === parseInt(hiddenTool)),
      )
      .map((hiddenTool) => parseInt(hiddenTool));
  }

  // Object containing all hidden columns from the URL with an individual entry for each runset (= params of the form "hiddenX" for runset X)
  const hiddenCols = {};
  const hiddenParams = Object.keys(urlParams).filter((param) =>
    /hidden[0-9]+/.test(param),
  );
  hiddenParams.forEach((hiddenParam) => {
    const toolIdx = parseInt(hiddenParam.replace("hidden", ""));
    const tool = tools.find((tool) => tool.toolIdx === toolIdx);
    if (Number.isInteger(toolIdx) && tool) {
      hiddenCols[toolIdx] = urlParams[hiddenParam]
        .split(",")
        .filter(
          (hiddenCol) =>
            Number.isInteger(parseInt(hiddenCol)) &&
            tool.columns.some((col) => col.colIdx === parseInt(hiddenCol)),
        )
        .map((col) => parseInt(col));
    }
  });

  // Set all columns of a hidden runset to hidden
  hiddenTools.forEach((hiddenToolIdx) => {
    hiddenCols[hiddenToolIdx] = tools
      .find((tool) => tool.toolIdx === hiddenToolIdx)
      .columns.map((column) => column.colIdx);
  });

  // Leave hidden columns for not mentioned tools empty
  tools.forEach((tool) => {
    if (!hiddenCols[tool.toolIdx]) {
      hiddenCols[tool.toolIdx] = [];
    }
  });

  return hiddenCols;
};

/**
 * Returns the index of the first runset that has a column that is not hidden and not of the type status, as well as the index
 * of the corresponding column. In case there is no such column, returns the index of the first runset that has a status column
 * that is not hidden, as well as the index of this column. In case there is also no such column, i.e. all columns of all runsets
 * are hidden, returns undefined for those values.
 **/
const getFirstVisibles = (tools, hiddenCols) => {
  let visibleCol;
  let visibleTool = tools.find((tool) => {
    visibleCol = tool.columns.find(
      (col) =>
        col.type !== "status" && !hiddenCols[tool.toolIdx].includes(col.colIdx),
    );
    return visibleCol;
  });

  if (!visibleCol) {
    visibleTool = tools.find(
      (tool) =>
        (visibleCol = tool.columns.find(
          (col) =>
            col.type === "status" &&
            !hiddenCols[tool.toolIdx].includes(col.colIdx),
        )),
    );
  }

  return visibleTool && visibleCol
    ? [visibleTool.toolIdx, visibleCol.colIdx]
    : [undefined, undefined];
};

/**
 * Checks if all distinct elements of the data param also
 * exist in the compare param.
 * Only to be used with primitives. Objects will be compared by reference.
 *
 *
 * @param {Any[]} compare The array to compare elements to
 * @param {Any[]} data The array to check
 */
const hasSameEntries = (compare, data) => {
  const compareObj = {};

  for (const elem of compare) {
    compareObj[elem] = true;
  }
  for (const elem of data) {
    if (isNil(compareObj[elem])) {
      return false;
    }
  }

  return true;
};

/**
 * Naive check if a filter value is a category (currently identifiable by a trailing " ")
 * @param {string} item - the filter value
 * @returns {boolean} True if value is a category, else false
 */
const isCategory = (item) => item && item[item.length - 1] === " ";

/**
 * This function uses string operations to get the smallest decimal part of a number.
 * If a number is an integer, the return value will be 1
 * A return type of string is used to prevent a small number to take the shape of
 * a scientific notation, as they are incompatible with the "step" attribute of
 * html inputs.
 *
 * @param {string} num - The number to check
 * @returns {string} - The smallest step
 */
const getStep = (num) => {
  const stringRep = num.toString();
  const [, decimal] = stringRep.split(/,|\./);
  if (isNil(decimal) || decimal.length === 0) {
    return 1;
  }
  let out = ".";
  for (let i = 0; i < decimal.length - 1; i += 1) {
    out += "0";
  }
  out += "1";
  return out;
};

/**
 * Computes and returns all ids of the given columns that are hidden. Assumes that
 * the columns object is in the format that is used in the ReactTable and Summary component.
 */
const getHiddenColIds = (columns) => {
  const hiddenColIds = [];
  // Idx 0 is the title column and every uneven idx is the separator column, so only check for hidden cols in every even column entry greater than 0
  columns = columns.filter((col, idx) => idx % 2 === 0 && idx !== 0);
  columns.forEach((col) =>
    hiddenColIds.push(
      col.columns.filter((column) => column.hidden).map((column) => column.id),
    ),
  );
  return hiddenColIds.flat();
};

export {
  prepareTableData,
  getRawOrDefault,
  isNumericColumn,
  numericSortMethod,
  textSortMethod,
  determineColumnWidth,
  formatColumnTitle,
  getRunSetName,
  isOkStatus,
  isNil,
  EXTENDED_DISCRETE_COLOR_RANGE,
  getHashSearch,
  setHashSearch,
  setConstantHashSearch,
  setParam,
  createHiddenColsFromURL,
  stringAsBoolean,
  without,
  pathOr,
  path,
  omit,
  deepEquals,
  NumberFormatterBuilder,
  emptyStateValue,
  getTaskIdParts,
  getFirstVisibles,
  hasSameEntries,
  isCategory,
  getStep,
  makeUrlFilterDeserializer,
  makeUrlFilterSerializer,
  makeFilterSerializer,
  makeFilterDeserializer,
  getHiddenColIds,
};
