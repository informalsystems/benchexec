// This file is part of BenchExec, a framework for reliable benchmarking:
// https://github.com/sosy-lab/benchexec
//
// SPDX-FileCopyrightText: 2019-2020 Dirk Beyer <https://www.sosy-lab.org>
//
// SPDX-License-Identifier: Apache-2.0

// enzyme
import { configure } from "enzyme";
import Adapter from "enzyme-adapter-react-16";

// Used by @zip.js/zip.js, but not implemented in jsdom via jest, so manually mock it here
window.crypto = jest.fn();

configure({ adapter: new Adapter() });

// We use jest snapshots for integration tests, and they become quite large.
// It is not really recommended by jest to do this, but this still seems like
// the best option for us. So at least we apply some custom serializers that
// help shrink the size and reduce irrelevant syntactic differences.

// Top-level serializer that does post-processing on the final string
expect.addSnapshotSerializer({
  print: (val, serialize) =>
    serialize(val.toJSON())
      .split("\n")
      // filter empty lines
      .filter((s) => !s.match(/^ *$/))
      // filter handler attributes (nothing important visible)
      .filter((s) => !s.match(/^ *on[a-zA-Z]*=\{\[Function\]\}$/))
      // reduce indentation to one space
      .map((s) => {
        const trimmed = s.trimStart();
        return " ".repeat((s.length - trimmed.length) / 2) + trimmed;
      })
      .join("\n"),
  test: (val) => val && val.hasOwnProperty("toJSON"),
});

// Serializer that simplifies HTML elements with several children,
// if all children are strings by joining the strings (better readable)
expect.addSnapshotSerializer({
  print: (val, serialize) => {
    val.children = [val.children.filter((s) => !s.match(/^ *$/)).join("")];
    return serialize(val);
  },
  test: (val) =>
    val &&
    Array.isArray(val.children) &&
    val.children.length > 1 &&
    val.children.every((o) => typeof o === "string"),
});

// Serializer that simplifies HTML elements with one empty child
// (normalizes <div></div> to <div />)
expect.addSnapshotSerializer({
  print: (val, serialize) => {
    delete val.children;
    return serialize(val);
  },
  test: (val) =>
    val &&
    Array.isArray(val.children) &&
    val.children.length === 1 &&
    !val.children[0],
});

// Serializer that simplies the dangerouslySetInnerHTML attribute
expect.addSnapshotSerializer({
  print: (val, serialize) => serialize(val.__html),
  test: (val) => val && val.hasOwnProperty("__html"),
});

// Serializer that hides empty style attributes.
expect.addSnapshotSerializer({
  print: (val, serialize) => {
    delete val.props.style;
    return serialize(val);
  },
  test: (val) =>
    val &&
    val.props &&
    val.props.style &&
    val.props.style.constructor === Object &&
    Object.keys(val.props.style).length === 0,
});
