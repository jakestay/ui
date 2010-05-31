/*
Copyright 2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jqUnit, jQuery, jqMock, cspace, fluid, start, stop, ok, same*/

var rendererTester = function(){

    cspace.testDecorator = {
        getDecoratorOptions: function (parentComponent) {
            return {
                option1: parentComponent.options.opt1,
                option2: parentComponent.options.opt2
            };
        }
    };

    var rendererTest = new jqUnit.TestCase("Renderer Tests");

    rendererTest.test("buildProtoTree(): Basic tree, empty model", function () {
        var testUISpec = {
            selector1: "${field1}",
            selector2: "${field2}",
            selector3: "${field3}"
        };
        var testThat = {};
        var expectedProtoTree = {
            selector1: "${field1}",
            selector2: "${field2}",
            selector3: "${field3}"
        };
        var protoTree = cspace.renderUtils.buildProtoTree(testUISpec, testThat);
        jqUnit.assertDeepEq("Basic proto pree should be correct", expectedProtoTree, protoTree);
    });
    
    rendererTest.test("buildProtoTree(): Repeated rows", function () {
        var testUISpec = {
            "rowSelector:": {
                children: [
                    { selector1: "${repeated.0.field1}",
                      selector2: "${repeated.0.field2}" }
                ]
            }
        };
        var testModel = {
            repeated: [
                { field1: "value1a", field2: "value2a" },
                { field1: "value1b", field2: "value2b" },
                { field1: "value1c", field2: "value2c" }
            ]
        };
        var testThat = {
            model: testModel
        };
        var expectedProtoTree = {
            "rowSelector:": {
                children: [
                    { selector1: "${repeated.0.field1}",
                      selector2: "${repeated.0.field2}" },
                    { selector1: "${repeated.1.field1}",
                      selector2: "${repeated.1.field2}" },
                    { selector1: "${repeated.2.field1}",
                      selector2: "${repeated.2.field2}" }
                ]
            }
        };
        var protoTree = cspace.renderUtils.buildProtoTree(testUISpec, testThat);
        jqUnit.assertDeepEq("Repeated rows should be present in proto tree.", expectedProtoTree, protoTree);
    });

    rendererTest.test("buildProtoTree(): Repeated rows, no data, decorator comes before valuebinding (CSPACE-1888)", function () {
        var testUISpec = {
            "rowSelector:": {
                children: [
                    { selector1: {
                            decorators: [{
                                type: "fluid",
                                func: "cspace.testDecorator"
                            }]
                        },
                      selector2: "${repeated.0.field2}" }
                ]
            }
        };
        var testModel = {
        };
        var testThat = {
            model: testModel
        };
        var expectedProtoTree = {
            "rowSelector:": {
                children: [
                    { selector1: {
                            decorators: [{
                                type: "fluid",
                                func: "cspace.testDecorator"
                            }]
                        },
                      selector2: "${repeated.0.field2}" }
                ]
            }
        };
        var expectedUpdatedModel = {
            repeated: []
        };
        var protoTree = cspace.renderUtils.buildProtoTree(testUISpec, testThat);
        jqUnit.assertDeepEq("One row should be present in proto tree.", expectedProtoTree, protoTree);
        jqUnit.assertDeepEq("Model should be updated to reflect repeated field.", expectedUpdatedModel, testThat.model);
    });

    rendererTest.test("buildProtoTree(): Repeated rows, repeated data, decorator comes before valuebinding (CSPACE-1888)", function () {
        var testUISpec = {
            "rowSelector:": {
                children: [
                    { selector1: {
                            decorators: [{
                                type: "fluid",
                                func: "cspace.testDecorator"
                            }]
                        },
                      selector2: "${repeated.0.field2}" }
                ]
            }
        };
        var testModel = {
            repeated: [
                {field2: "foo"},
                {field2: "bar"},
                {field2: "bat"}
            ]
        };
        var testThat = {
            model: testModel
        };
        var expectedProtoTree = {
            "rowSelector:": {
                children: [
                    { selector1: {
                            decorators: [{
                                type: "fluid",
                                func: "cspace.testDecorator"
                            }]
                        },
                      selector2: "${repeated.0.field2}" },
                    { selector1: {
                            decorators: [{
                                type: "fluid",
                                func: "cspace.testDecorator"
                            }]
                        },
                      selector2: "${repeated.1.field2}" },
                    { selector1: {
                            decorators: [{
                                type: "fluid",
                                func: "cspace.testDecorator"
                            }]
                        },
                      selector2: "${repeated.2.field2}" }
                ]
            }
        };
        var protoTree = cspace.renderUtils.buildProtoTree(testUISpec, testThat);
        jqUnit.assertDeepEq("One row should be present in proto tree.", expectedProtoTree, protoTree);
    });

    rendererTest.test("buildProtoTree(): Decorators", function () {
        var testUISpec = {
            selector: {
                decorators: [{
                    type: "fluid",
                    func: "cspace.testDecorator"
                }]
            }
        };
        var testThat = {
            options: {
                opt1: "foo",
                opt2: "bar"
            }
        };
        var expectedProtoTree = {
            selector: {
                decorators: [{
                    type: "fluid",
                    func: "cspace.testDecorator",
                    options: {
                        option1: "foo",
                        option2: "bar"
                    }
                }]
            }
        };

        var protoTree = cspace.renderUtils.buildProtoTree(testUISpec, testThat);
        jqUnit.assertDeepEq("Decorator options should be added to uispec decorator specification (no options in uispec)", expectedProtoTree, protoTree);

        testUISpec.selector.decorators[0].options = {
            newOpt: "bat"
        };
        expectedProtoTree.selector.decorators[0].options.newOpt = "bat";

        protoTree = cspace.renderUtils.buildProtoTree(testUISpec, testThat);
        jqUnit.assertDeepEq("Decorator options should be added to uispec decorator specification (existing options in uispec shouldn't be overwritten)", expectedProtoTree, protoTree);
    });

    rendererTest.test("buildProtoTree(): Repeated decorators, no data", function () {
        var testUISpec = {
            "row:": {
                children: [{
                    fieldA: "${repeated.0.field1}",
                    fieldB: {
                        decorators: [{
                            "type": "fluid",
                            "func": "cspace.autocomplete",
                            "options": {
                                "url": "url.com"
                            }
                        }]
                    }
                }]
            }
        };
        var testModel = {
            repeated: []
        };
        var testThat = {
            model: testModel
        };
        var expectedProtoTree = {
            "row:": {
                children: [{
                    fieldA: "${repeated.0.field1}",
                    fieldB: {
                        decorators: [{
                            "type": "fluid",
                            "func": "cspace.autocomplete",
                            "options": {
                                "url": "url.com"
                            }
                        }]
                    }
                }]
            }
        };
        var protoTree = cspace.renderUtils.buildProtoTree(testUISpec, testThat);
        jqUnit.assertDeepEq("Decorator should be in protoTree", expectedProtoTree, protoTree);
    });

    rendererTest.test("buildProtoTree(): Fix of selections if model empty", function () {
        var testUISpec = {
            selector: {
                selection: "${field1}",
                optionlist: ["opt1", "opt2"],
                optionnames: ["Option 1", "Option 2"]
            }
        };
        var testThat = {
            model: {}
        };
        var expectedModel = {
            field1: ""
        };
        var protoTree = cspace.renderUtils.buildProtoTree(testUISpec, testThat);
        jqUnit.assertDeepEq("Process should add missing fields to model", expectedModel, testThat.model);
    });

    rendererTest.test("buildProtoTree(): Links", function () {
        var testUISpec = {
            selector1: {
                linktext: "${displayText}",
                target: "page.html?csid=${csid}"
            }
        };
        var testThat = {
            model: {
                displayText: "Link Text",
                csid: "testID"
            }
        };
        var expectedProtoTree = {
            selector1: {
                linktext: "Link Text",
                target: "page.html?csid=testID"
            }
        };
        var protoTree = cspace.renderUtils.buildProtoTree(testUISpec, testThat);
        jqUnit.assertDeepEq("Links should be properly expanded", expectedProtoTree, protoTree);
    });

    rendererTest.test("buildSelectorsFromUISpec()", function () {
        var testUISpec = {
            selector1: "${field1}",
            selector2: "${field2}",
            selector3: "${field3}"
        };
        var testSelectors = {};
        var expectedSelectors = {
            selector1: "selector1",
            selector2: "selector2",
            selector3: "selector3"
        };
        cspace.renderUtils.buildSelectorsFromUISpec(testUISpec, testSelectors);
        jqUnit.assertDeepEq("Selectors added to empty list", expectedSelectors, testSelectors);

        testSelectors = {
            existingSelector: ".foo"
        };
        expectedSelectors.existingSelector = ".foo";
        cspace.renderUtils.buildSelectorsFromUISpec(testUISpec, testSelectors);
        jqUnit.assertDeepEq("New selectors should overwrite existing selectors", expectedSelectors, testSelectors);
    });
    
    rendererTest.test("fixSelectionsInTree()", function () {
        var testProtoTree = {
            selector: {
                selection: "${field1}",
                optionlist: ["opt1", "opt2"],
                optionnames: ["Option 1", "Option 2"]
            }
        };
        var expectedBadTree = {
            children: [{
                ID: "selector",
                selection: { valuebinding: "field1" },
                optionlist: [
                    {value: "opt1"},
                    {value: "opt2"}
                ],
                optionnames: [
                    {value: "Option 1"},
                    {value: "Option 2"}
                ]
            }]
        };
        var expander = fluid.renderer.makeProtoExpander({ELstyle: "${}"});
        var testTree = expander(testProtoTree);
        jqUnit.assertDeepEq("First, confirm the bug is present in the expander", expectedBadTree, testTree);
        var expectedFixedTree = {
            children: [{
                ID: "selector",
                selection: { valuebinding: "field1" },
                optionlist: ["opt1", "opt2"],
                optionnames: ["Option 1", "Option 2"]
            }]
        };
        cspace.renderUtils.fixSelectionsInTree(testTree);
        jqUnit.assertDeepEq("Selections should be fixed", expectedFixedTree, testTree);
    });

    rendererTest.test("Rows already repeated in UISpec: no data model", function () {
        var testUISpec = {
            ".selector1": "${fields.field1}",
            ".selector2-row:": {
                children: [
                    {
                        ".selectorA": "${fields.fields2.0.fieldA}",
                        ".selectorB": "Straight text 1"
                    },
                    {
                        ".selectorA": "${fields.fields2.1.fieldA}",
                        ".selectorB": "Straight text 2"
                    },
                    {
                        ".selectorA": "${fields.fields2.2.fieldA}",
                        ".selectorB": "Straight text 3"
                    }
                ]
            },
            ".selector3-row:": {
                children: [
                    {
                        ".selectorX": "${fields.fields3.0.fieldX}",
                        ".selectorZ": "Different straight text"
                    }
                ]
            }
        };
        var expectedProtoTree = {};
        fluid.model.copyModel(expectedProtoTree, testUISpec); // with no data model, should be same
        var testThat = {model: {}};
        var expectedModel = {
            fields: {
                fields2: [],
                fields3: []
            }
        };
        var protoTree = cspace.renderUtils.buildProtoTree(testUISpec, testThat);
        jqUnit.assertDeepEq("ProtoTree should look just like UISpec", expectedProtoTree, protoTree);
        jqUnit.assertDeepEq("Model should have been updated to include empty arrays", testThat.model, expectedModel);
    });

    rendererTest.test("Rows already repeated in UISpec: with data model", function () {
        var testUISpec = {
            ".selector1": "${fields.field1}",
            ".selector2-row:": {
                children: [
                    {
                        ".selectorA": "${fields.fields2.0.fieldA}",
                        ".selectorB": "Straight text 1"
                    },
                    {
                        ".selectorA": "${fields.fields2.1.fieldA}",
                        ".selectorB": "Straight text 2"
                    },
                    {
                        ".selectorA": "${fields.fields2.2.fieldA}",
                        ".selectorB": "Straight text 3"
                    }
                ]
            },
            ".selector3-row:": {
                children: [
                    {
                        ".selectorX": "${fields.fields3.0.fieldX}",
                        ".selectorY": "${fields.fields3.0.fieldY}"
                    }
                ]
            }
        };
        var testModel = {
            fields: {
                field1: "foo",
                fields2: [
                    { fieldA: "for" },
                    { fieldA: "fan" },
                    { fieldA: "tap" }
                ],
                fields3: [
                    { fieldX: "bar", fieldY: "bat" },
                    { fieldX: "car", fieldY: "cat" },
                    { fieldX: "can", fieldY: "ban" }
                ]
            }
        };
        var expectedProtoTree = {};
        fluid.model.copyModel(expectedProtoTree, testUISpec); // protoTree will start out the same
        expectedProtoTree[".selector3-row:"].children[1] = {
                                                                ".selectorX": "${fields.fields3.1.fieldX}",
                                                                ".selectorY": "${fields.fields3.1.fieldY}"
                                                            };
        expectedProtoTree[".selector3-row:"].children[2] = {
                                                                ".selectorX": "${fields.fields3.2.fieldX}",
                                                                ".selectorY": "${fields.fields3.2.fieldY}"
                                                            };
        var testThat = {model: {}};
        fluid.model.copyModel(testThat.model, testModel);
        var protoTree = cspace.renderUtils.buildProtoTree(testUISpec, testThat);
        jqUnit.assertDeepEq("ProtoTree have repeated rows expanded", expectedProtoTree, protoTree);
        jqUnit.assertDeepEq("Model should be unchanged", testThat.model, testModel);
    });
};

(function () {
    rendererTester();
}());
