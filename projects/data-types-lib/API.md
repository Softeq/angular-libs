# API

## `numberType` options

<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Description</th>
      <th>Example</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td colspan="3"><b>Format</b></td>
    </tr>
    <tr>
      <td><code>format.minimumFractionDigits</code></td>
      <td>Sets minimum number of fractional digits</td>
      <td>
<pre>numberType({
  format: {
    minimumFractionDigits: 1,
  },
})</pre>
      </td>
    </tr>
    <tr>
      <td><code>format.maximumFractionDigits</code></td>
      <td>Sets maximum number of fractional digits</td>
      <td>
<pre>numberType({
  format: {
    maximumFractionDigits: 1,
  },
})</pre>
      </td>
    </tr>
    <tr>
      <td colspan="3"><b>Constraints</b></td>
    </tr>
    <tr>
      <td><code>constraints.integral</code></td>
      <td>Constraint <code>number</code> value to integrals-only</td>
      <td>
<pre>numberType({
  constraints: {
    integral: true,
  },
})</pre>
      </td>
    </tr>
    <tr>
      <td><code>constraints.min</code></td>
      <td>Constraint minimal allowed value</td>
      <td>
<pre>numberType({
  constraints: {
    min: 10,
    // the same as
    // min: { value: 10, include: true },
    //
    // or excluding minimal value: 10 is invalid,
    //                             11 is valid
    // min: { value: 10, include: false },
  },
})</pre>
      </td>
    </tr>
    <tr>
      <td><code>constraints.max</code></td>
      <td>Constraint maximal allowed value</td>
      <td>
<pre>numberType({
  constraints: {
    max: 20,
    // the same as
    // max: { value: 20, include: true },
    //
    // or excluding maximal value: 20 is invalid
    //                             19 is valid
    // max: { value: 20, include: false },
  },
})</pre>
      </td>
    </tr>
    <tr>
      <td><code>constraints.range</code></td>
      <td>Constraint minimal and maximal allowed values</td>
      <td>
<pre>numberType({
  constraints: {
    range: [10, 20],
    // the same as
    // range: { min: 10, max: 20 },
    //
    // the same as
    // range: {
    //   min: 10, max: 20,
    //   includeMin: true, includeMax: true,
    // },
    //
    // or excluding some boundaries: 10 is invalid
    //                               20 is valid
    //                               11 is valid
    // range: {
    //   min: 10, max: 20,
    //   includeMin: false, includeMax: true,
    // },
  },
})</pre>
      </td>
    </tr>
    <tr>
      <td colspan="3"><b>Messages</b></td>
    </tr>
    <tr>
      <td><code>messages.min</code></td>
      <td>Set violation message for <code>min</code> constraint</td>
      <td>
<pre>numberType({
  constraints: {
    min: 10,
  },
  messages: {
    // format of MLS record depends on @softeq/mls
    // contract implementation
    min: 'msg_number_min',
  },
})</pre>
      </td>
    </tr>
    <tr>
      <td><code>messages.max</code></td>
      <td>Set violation message for <code>max</code> constraint</td>
      <td>
<pre>numberType({
  constraints: {
    max: 20,
  },
  messages: {
    // format of MLS record depends on @softeq/mls
    // contract implementation
    max: 'msg_number_max',
  },
})</pre>
      </td>
    </tr>
    <tr>
      <td><code>messages.range</code></td>
      <td>Set violation message for <code>range</code> constraint</td>
      <td>
<pre>numberType({
  constraints: {
    range: [10, 20],
  },
  messages: {
    // format of MLS record depends on @softeq/mls
    // contract implementation
    range: 'msg_number_range',
  },
})</pre>
      </td>
    </tr>
    <tr>
      <td><code>messages.format</code></td>
      <td>Set violation message generated when text cannot be parsed to <code>number</code></td>
      <td>
<pre>numberType({
  messages: {
    // format of MLS record depends on @softeq/mls
    // contract implementation
    format: 'msg_number_format',
  },
})</pre>
      </td>
    </tr>
  </tbody>
</table>

## `dateTimeType` options

<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Description</th>
      <th>Example</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td colspan="3"><b>Format</b></td>
    </tr>
    <tr>
      <td><code>format</code></td>
      <td>Name of date/time format. Name of format depends on <code>@softeq/mls</code> contract implementation</td>
      <td>
<pre>dateTimeType({
  format: 'shortDate',
})</pre>
      </td>
    </tr>
    <tr>
      <td colspan="3"><b>Constraints</b></td>
    </tr>
    <tr>
      <td><code>constraints.min</code></td>
      <td>Constraint minimal allowed date</td>
      <td>
<pre>dateTimeType({
  constraints: {
    min: new Date(2000),
    // the same as
    // min: { value: new Date(2000), include: true },
    //
    // or excluding minimal date: new Date(2000) is invalid,
    //                            new Date(2001) is valid
    // min: { value: new Date(2000), include: false },
  },
})</pre>
      </td>
    </tr>
    <tr>
      <td><code>constraints.max</code></td>
      <td>Constraint maximal allowed date</td>
      <td>
<pre>dateTimeType({
  constraints: {
    max: new Date(2010),
    // the same as
    // max: { value: new Date(2010), include: true },
    //
    // or excluding minimal date: new Date(2010) is invalid,
    //                            new Date(2009) is valid
    // max: { value: new Date(2010), include: false },
  },
})</pre>
      </td>
    </tr>
    <tr>
      <td><code>constraints.range</code></td>
      <td>Constraint minimal and maximal allowed dates</td>
      <td>
<pre>dateTimeType({
  constraints: {
    range: [new Date(2000), new Date(2010)],
    // the same as
    // range: { min: new Date(2000), max: new Date(2010) },
    //
    // the same as
    // range: {
    //   min: new Date(2000), max: new Date(2010),
    //   includeMin: true, includeMax: true,
    // },
    //
    // or excluding some boundaries: new Date(2000) is invalid
    //                               new Date(2010) is valid
    //                               new Date(2001) is valid
    // range: {
    //   min: new Date(2000), max: new Date(2010),
    //   includeMin: false, includeMax: true,
    // },
  },
})</pre>
      </td>
    </tr>
    <tr>
      <td colspan="3"><b>Messages</b></td>
    </tr>
    <tr>
      <td><code>messages.min</code></td>
      <td>Set violation message for <code>min</code> constraint</td>
      <td>
<pre>dateTimeType({
  constraints: {
    min: new Date(2000),
  },
  messages: {
    // format of MLS record depends on @softeq/mls
    // contract implementation
    min: 'msg_date_min',
  },
})</pre>
      </td>
    </tr>
    <tr>
      <td><code>messages.max</code></td>
      <td>Set violation message for <code>max</code> constraint</td>
      <td>
<pre>dateTimeType({
  constraints: {
    max: new Date(2010),
  },
  messages: {
    // format of MLS record depends on @softeq/mls
    // contract implementation
    max: 'msg_date_max',
  },
})</pre>
      </td>
    </tr>
    <tr>
      <td><code>messages.range</code></td>
      <td>Set violation message for <code>range</code> constraint</td>
      <td>
<pre>dateTimeType({
  constraints: {
    range: [new Date(2000), new Date(2010)],
  },
  messages: {
    // format of MLS record depends on @softeq/mls
    // contract implementation
    range: 'msg_date_range',
  },
})</pre>
      </td>
    </tr>
    <tr>
      <td><code>messages.invalid</code></td>
      <td>Set violation message generated when date is invalid</td>
      <td>
<pre>dateTimeType({
  messages: {
    // format of MLS record depends on @softeq/mls
    // contract implementation
    invalid: 'msg_date_invalid',
  },
})</pre>
      </td>
    </tr>
    <tr>
      <td><code>messages.format</code></td>
      <td>Set violation message generated when text cannot be parsed to <code>number</code></td>
      <td>
<pre>dateTimeType({
  messages: {
    // format of MLS record depends on @softeq/mls
    // contract implementation
    format: 'msg_date_format',
  },
})</pre>
      </td>
    </tr>
  </tbody>
</table>


## `textType` options

<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Description</th>
      <th>Example</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td colspan="3"><b>Constraints</b></td>
    </tr>
    <tr>
      <td><code>constraints.minLength</code></td>
      <td>Constraint minimal allowed string length</td>
      <td>
<pre>textType({
  constraints: {
    minLength: 10,
  },
})</pre>
      </td>
    </tr>
    <tr>
      <td><code>constraints.maxLength</code></td>
      <td>Constraint maximal allowed string length</td>
      <td>
<pre>textType({
  constraints: {
    maxLength: 20,
  },
})</pre>
      </td>
    </tr>
    <tr>
      <td><code>constraints.rangeLength</code></td>
      <td>Constraint minimal and maximal allowed text length</td>
      <td>
<pre>textType({
  constraints: {
    rangeLength: [10, 20],
    // the same as
    // rangeLength: { min: 10, max: 20 },
  },
})</pre>
      </td>
    </tr>
    <tr>
      <td><code>constraints.pattern</code></td>
      <td>Constraint string by pattern</td>
      <td>
<pre>textType({
  constraints: {
    pattern: /^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[a-zA-Z0-9]+$/,
  },
})</pre>
      </td>
    </tr>
    <tr>
      <td colspan="3"><b>Messages</b></td>
    </tr>
    <tr>
      <td><code>messages.minLength</code></td>
      <td>Set violation message for <code>minLength</code> constraint</td>
      <td>
<pre>textType({
  constraints: {
    minLength: 10,
  },
  messages: {
    // format of MLS record depends on @softeq/mls
    // contract implementation
    minLength: 'msg_text_min_length',
  },
})</pre>
      </td>
    </tr>
    <tr>
      <td><code>messages.maxLength</code></td>
      <td>Set violation message for <code>maxLength</code> constraint</td>
      <td>
<pre>textType({
  constraints: {
    maxLength: 20,
  },
  messages: {
    // format of MLS record depends on @softeq/mls
    // contract implementation
    maxLength: 'msg_text_max_length',
  },
})</pre>
      </td>
    </tr>
    <tr>
      <td><code>messages.rangeLength</code></td>
      <td>Set violation message for <code>rangeLength</code> constraint</td>
      <td>
<pre>textType({
  constraints: {
    rangeLength: [10, 20],
  },
  messages: {
    // format of MLS record depends on @softeq/mls
    // contract implementation
    rangeLength: 'msg_text_range_length',
  },
})</pre>
      </td>
    </tr>
    <tr>
      <td><code>messages.pattern</code></td>
      <td>Set violation message for <code>pattern</code> constraint</td>
      <td>
<pre>textType({
  messages: {
    // format of MLS record depends on @softeq/mls
    // contract implementation
    pattern: 'msg_text_pattern',
  },
})</pre>
      </td>
    </tr>
  </tbody>
</table>
