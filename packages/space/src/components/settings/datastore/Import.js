import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { CoreAPI } from 'react-kinetic-core';
import { Line } from 'rc-progress';
import { Table } from 'reactstrap';
import { Set, List, fromJS } from 'immutable';
import Papa from 'papaparse';

import { actions } from '../../../redux/modules/settingsDatastore';

/**
 *   This function creates the map that is used to match the csv's headers
 *  to feilds on the form.
 *
 * @param {Array} headers - First Row of the csv
 * @param {Array} formFieldNames - All the names of the fields on the form.
 * @return {}
 */
export const createHeaderToFieldMap = (headers, formFieldNames) => {
  const headersSet = Set(headers);
  const missingFields = headersSet.subtract(formFieldNames);

  const tempSetA = headersSet.intersect(formFieldNames).reduce((acc, val) => {
    const obj = { header: val, field: val, checked: false };
    return acc.add(obj);
  }, Set([]));

  const tempSetB = missingFields.reduce((acc, val) => {
    const obj = { header: val, field: '', checked: false };
    return acc.add(obj);
  }, Set([]));

  const unionSet = tempSetA
    .union(tempSetB)
    .sort((a, b) => {
      if (a.field < b.field) {
        return -1;
      }
      if (a.field > b.field) {
        return 1;
      }
      if (a.field === b.field) {
        return 0;
      }
      return null;
    })
    .toList();

  return {
    headerToFieldMap: unionSet,
    missingFields,
    recordsHeaders: headersSet,
  };
};
/**
 *  Find is there are headers that have not been mapped to fields.
 *
 * @param {List} headerMapList - A map of headers to field names.
 * @return {List}
 */
const findMissingFields = headerMapList =>
  headerMapList
    .filter(
      obj =>
        obj.field === '' &&
        !obj.checked &&
        obj.header.toLocaleLowerCase() !== 'datastore record id',
    )
    .reduce((acc, obj) => {
      return acc.push(obj.header);
    }, List([]));

export class ImportComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      processing: false,
      postResult: false,
      submissions: [],
      records: [],
      recordsHeaders: Set([]),
      formSlug: props.form.slug,
      missingFields: List([]),
      mapHeadersShow: false,
      percentComplete: 0,
      modal: false,
    };
    this.form = {};
    this.formFieldNames = [];
    this.calls = [];
    this.failedCalls = [];
    this.readFile = null;
    this.formFieldNames = props.form.fields.reduce((acc, field) => {
      acc.push(field.name);
      return acc;
    }, []);
    this.formFields = props.form.fields;
  }

  post = ([head, ...tail]) => {
    // percentComplete is used to dynamically change the progress bar.
    this.setState({
      percentComplete:
        100 - Math.round((tail.length / this.state.records.length) * 100),
    });

    /*  The below code will to a sequential post/put for all of the records on state. 
     * It has been written to extend it functionality to batch calls in the future.
     */

    const promise = head.id
      ? CoreAPI.updateSubmission({
          datastore: true,
          formSlug: this.state.formSlug,
          values: head.values,
          id: head.id,
        })
      : CoreAPI.createSubmission({
          datastore: true,
          formSlug: this.state.formSlug,
          values: head.values,
        });

    promise.then(response => {
      if (response.serverError || response.errors) {
        this.failedCalls.push({ response, record: head });
      }

      if (tail.length > 0) {
        this.post(tail);
      } else {
        Promise.all(this.calls).then(() => {
          // This is used to reset the progress bar after the post process completes.
          this.setState({
            processing: false,
            percentComplete: 0,
            postResult: true,
          });
          this.handleReset();
        });
      }
    });
    this.calls.push(promise);
  };

  handleReset = () => {
    this.readFile = null;
    this.setState({
      records: [],
      recordsHeaders: Set([]),
      missingFields: List([]),
      percentComplete: 0,
    });
  };

  handleImport = () => {
    this.setState({
      processing: true,
      mapHeadersShow: false,
    });
    this.calls = [];
    this.post(this.state.records);
  };

  /*  headerToFieldMap must be passed in because handleSelect and handleOmit update headerToFieldMap
   * in state just before calling handleCsvToJson.  If we used this.state.headerToFieldMap we would
   * get a stale version of the data.
  */
  handleCsvToJson = headerToFieldMap => {
    const resultsList = fromJS(this.parseResults.data);
    this.setState({
      records: resultsList.reduce((arr, csvRowMap) => {
        let obj = {
          values: {},
        };
        csvRowMap.forEach((val, header) => {
          const found = headerToFieldMap.find(obj => obj.header === header);
          if (
            found.header.toLocaleLowerCase() === 'datastore record id' &&
            !(val === '')
          ) {
            obj.id = val;
          } else if (!found.checked) {
            const fieldObject = this.formFields.find(
              field => field.name === header,
            );
            if (fieldObject && fieldObject.dataType === 'json') {
              obj.values = {
                ...obj.values,
                [found.field]: val ? JSON.parse(val) : [],
              };
            } else {
              obj.values = { ...obj.values, [found.field]: val ? val : null };
            }
          }
        });
        arr.push(obj);
        return arr;
      }, []),
    });
  };

  handleFieldCheck = () => {
    const headers = this.parseResults.meta.fields;
    let obj;

    obj = createHeaderToFieldMap(headers, this.formFieldNames);

    this.setState({
      headerToFieldMap: obj.headerToFieldMap,
      missingFields: obj.missingFields,
      recordsHeaders: obj.recordsHeaders,
    });
    if (obj.missingFields.size <= 0) {
      this.handleCsvToJson(obj.headerToFieldMap);
    }
  };

  handleShow = () => {
    this.setState({ mapHeadersShow: !this.state.mapHeadersShow });
  };

  // handleSave = () => {
  //   this.updateForm();
  //   this.setState({ mapHeadersShow: false });
  // };

  handleChange = event => {
    const file = this.fileEl.files[0];
    // If the user chooses to cancel the open.  Avoids an error with file.name and prevents unnecessary behavior.
    if (file) {
      this.setState({ fileName: file.name, postResult: false });
      const reader = new FileReader();
      reader.readAsText(this.fileEl.files[0]);
      this.readFile = reader;
      reader.onload = event => {
        Papa.parse(event.target.result, {
          header: true,
          complete: results => {
            //When streaming, parse results are not available in this callback.
            this.parseResults = results;
            this.handleFieldCheck();
          },
          error: errors => {
            //Test error handleing here.  This might not work if error is called each time a row has an error.
          },
        });
      };
    }
  };

  handleSelect = event => {
    const updatedList = this.state.headerToFieldMap.update(
      event.target.getAttribute('index'),
      obj => ({ ...obj, header: event.target.name, field: event.target.value }),
    );
    const missingFields = findMissingFields(updatedList);
    this.setState({
      headerToFieldMap: updatedList,
      missingFields,
    });
    if (missingFields.size <= 0) {
      this.handleCsvToJson(updatedList);
    }
  };

  handleOmit = event => {
    const updatedList = this.state.headerToFieldMap.update(
      event.target.getAttribute('index'),
      () => ({
        header: event.target.name,
        field: event.target.value,
        checked: event.target.checked,
      }),
    );
    const missingFields = findMissingFields(updatedList);
    this.setState({
      headerToFieldMap: updatedList,
      missingFields,
    });
    if (missingFields.size <= 0) {
      this.handleCsvToJson(updatedList);
    }
  };

  render() {
    return (
      <Fragment>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          {this.state.records.length > 0 &&
            this.state.missingFields.size <= 0 && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={this.handleImport}
              >
                Import Records
              </button>
            )}
          {this.readFile ? (
            <button className="btn btn-info btn-sm" onClick={this.handleReset}>
              Reset File
            </button>
          ) : (
            <Fragment>
              <input
                type="file"
                id="file-input"
                style={{ display: 'none' }}
                onChange={this.handleChange}
                ref={element => {
                  this.fileEl = element;
                }}
              />
              <label htmlFor="file-input" className="btn btn-info btn-sm">
                Choose A File
              </label>
            </Fragment>
          )}
          {this.state.recordsHeaders.size > 0 && (
            <button
              className="btn btn-success btn-sm"
              onClick={this.handleShow}
            >
              Map Headers
            </button>
          )}
        </div>
        <div className="forms-list-wrapper">
          {this.state.missingFields.size > 0 && (
            <div>
              <h5>The CSV has headers that do not exist on the form</h5>
              {this.state.missingFields.map(fieldName => <p>{fieldName}</p>)}
            </div>
          )}
          {this.state.processing && (
            <Line
              percent={this.state.percentComplete}
              strokeWidth="1"
              strokeColor="#5fba53"
            />
          )}
          {this.state.postResult && (
            <div>
              <h4>Post Results</h4>
              <p>{this.calls.length} records attempted to be posted</p>
              <p>{this.failedCalls.length} records failed</p>
            </div>
          )}
          {this.state.mapHeadersShow && (
            <Fragment>
              <table className="settings-table">
                <tbody>
                  {this.state.headerToFieldMap
                    .filter(
                      obj =>
                        obj.header.toLocaleLowerCase === 'datastore record id',
                    )
                    .map((obj, idx) => (
                      <tr key={obj.header + idx}>
                        <td>{obj.header}</td>
                        <td />
                        <td>
                          <input
                            type="checkbox"
                            id="omit"
                            name={obj.header}
                            index={idx}
                            value={obj.field}
                            checked={obj.checked}
                            onChange={this.handleOmit}
                          />
                          <label htmlFor="omit">Omit Column from Import</label>
                        </td>
                      </tr>
                    ))}
                  {this.state.headerToFieldMap.map((obj, idx) => {
                    if (
                      obj.header.toLocaleLowerCase() !== 'datastore record id'
                    ) {
                      return (
                        <tr key={obj.header + idx}>
                          <td>{obj.header}</td>
                          <td>
                            <select
                              onChange={this.handleSelect}
                              name={obj.header}
                              index={idx}
                              value={obj.field}
                            >
                              <option value={''}>Select Option</option>
                              {this.formFieldNames.map(fieldName => (
                                <option key={fieldName} value={fieldName}>
                                  {fieldName}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <input
                              type="checkbox"
                              id="omit"
                              name={obj.header}
                              index={idx}
                              value={obj.field}
                              checked={obj.checked}
                              onChange={this.handleOmit}
                            />
                            <label htmlFor="omit">
                              Omit Column from Import
                            </label>
                          </td>
                        </tr>
                      );
                    }
                    return null;
                  })}
                </tbody>
              </table>
              {/* <button
                className="btn btn-success btn-sm"
                onClick={this.handleSave}
              >
                Save
              </button> */}
            </Fragment>
          )}

          {!this.state.processing &&
            !this.state.postResult &&
            !this.state.mapHeadersShow &&
            this.state.records.length > 0 &&
            this.state.recordsHeaders.size > 0 && (
              <Fragment>
                <div>
                  <p>Review Records below.</p>
                </div>
                <Table className="table-responsive table-sm">
                  <thead>
                    <tr>
                      {this.state.headerToFieldMap.map((obj, idx) => (
                        <th key={obj.header + idx}>{obj.header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {this.state.records.map((record, idx) => {
                      const { values, id } = record;
                      return (
                        <tr key={idx}>
                          {this.state.headerToFieldMap.map((obj, idx) => {
                            if (
                              obj.field.toLocaleLowerCase() ===
                              'datastore record id'
                            ) {
                              return <td key={obj.field + idx}>{id}</td>;
                            }
                            return (
                              <td key={obj.field + idx}>{values[obj.field]}</td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </Fragment>
            )}
        </div>
      </Fragment>
    );
  }
}

export const mapStateToProps = state => ({
  form: state.space.settingsDatastore.currentForm,
});

export const mapDispatchToProps = {
  deleteAllSubmissions: actions.deleteAllSubmissions,
};

export const Import = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ImportComponent);
