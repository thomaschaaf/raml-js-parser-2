import lowLevel = require("./lowLevelAST")
import ds=require("raml-definition-system")
import typeSystem=ds.rt.nominalTypes;
import rTypes=ds.rt;
export type ITypeDefinition=typeSystem.ITypeDefinition;
export type IProperty=typeSystem.IProperty;
export interface AbstractWrapperNode {

    /**
     * @hidden
     **/
    wrapperClassName():string

    /**
     * @return Actual name of instance interface
     **/
    kind():string

    /**
     * @return RAML version of the node. "RAML10" for RAML 1.0 and "RAML08" for RAML 0.8.
     */
    RAMLVersion():string
}
export interface SerializeOptions{

    /**
     * For root nodes additional details can be included into output. If the option is set to `true`,
     * node content is returned as value of the **specification** root property. Other root properties are:
     *
     * * **ramlVersion** version of RAML used by the specification represented by the node
     * * **type** type of the node: Api, Overlay, Extension, Library, or any other RAML type in fragments case
     * * **errors** errors of the specification represented by the node
     * @default false
     */
    rootNodeDetails?:boolean

    /**
     * Whether to serialize metadata
     * @default true
     */
    serializeMetadata?:boolean


    dumpSchemaContents?: boolean
}
export interface BasicNode extends AbstractWrapperNode{

    /**
     * @return Direct ancestor in RAML hierarchy
     **/
    parent():BasicNode

    /**
     * @hidden
     * @return Underlying node of the High Level model
     **/
    highLevel():IHighLevelNode

    /**
     * @return Array of errors
     **/
    errors():RamlParserError[]

    /**
     * @return object representing class of the node
     **/
    definition():ITypeDefinition

    /**
     * @return for user class instances returns object representing actual user class
     **/
    runtimeDefinition():ITypeDefinition

    /**
     * Turns model node into an object.
     * @param node Model node
     * @return Stringifyable object representation of the node.
     **/
    toJSON(serializeOptions?:SerializeOptions):any

    /**
     * @return For siblings of traits or resource types returns an array of optional properties names.
     **/
    optionalProperties():string[]

    /**
     * @return Whether the element is an optional sibling of trait or resource type
     **/
    optional():boolean

    meta():NodeMetadata
}

export type INamedEntity=typeSystem.INamedEntity;

export type NamedId=typeSystem.NamedId;

export interface ValueMetadata{

    /**
     * Returns 'true', if the actual value is missing, and returned value has
     * been obtained from the RAML document by means of some rule.
     * @default false
     */
    calculated():boolean;

    /**
     * Returns 'true', if the actual value is missing, and returned value is
     * stated in the RAML spec as default for the property
     * @default false
     */
    insertedAsDefault():boolean;

    /**
     * Returns 'true' for optional siblings of traits and resource types
     * @default false
     */
    optional():boolean;

    /**
     * Returns 'true', if all values are default.
     */
    isDefault():boolean;

    toJSON():any;
}
export interface RamlParserError {

    /**
     * Error identifier
     */
    code: string;

    /**
     * Messag text
     */
    message: string;

    /**
     * File path
     */
    path: string;

    /**
     * RangeObject describing start and end of error location
     */
    range:RangeObject;

    /**
     * Whether the message is warning or not
     */
    isWarning: boolean;
    
    trace?:RamlParserError[];
}

export interface RangeObject{

    start: MarkerObject;

    end: MarkerObject;
}

export interface MarkerObject{

    line:number;

    column:number;

    position:number;
}

export interface NodeMetadata extends ValueMetadata{

    /**
     * Returns metadata for those properties of the node, whose type is primitive or an array of primitive.
     */
    primitiveValuesMeta():{[key:string]:ValueMetadata};
}

export type IArrayType =typeSystem.IArrayType

export type IUnionType = typeSystem.IUnionType;
export type IExpandableExample=typeSystem.IExpandableExample;

export type INodeDefinition = ITypeDefinition;
export interface IValueTypeDefinition extends ITypeDefinition{}
export type IUniverse= typeSystem.IUniverse;
export interface IValueDocProvider{
    (v:string):string
}
export interface IValueSuggester{
    (node:IHighLevelNode):string[]
}


export enum NodeKind {
    BASIC,
    NODE,
    ATTRIBUTE
}
export enum RAMLVersion{
    RAML10,
    RAML08
}
export interface IParseResult {
    hashkey(): string;
    errors():ValidationIssue[]

    lowLevel():lowLevel.ILowLevelASTNode
    name():string
    optional():boolean;
    root():IHighLevelNode
    isSameNode(n:IParseResult):boolean;
    
    parent():IHighLevelNode;
    setParent(node: IParseResult);
    children():IParseResult[];
    directChildren():IParseResult[];
    isAttached():boolean
    isImplicit():boolean
    isAttr():boolean
    asAttr():IAttribute;
    isElement():boolean;
    asElement():IHighLevelNode;
    localId():string;
    fullLocalId() : string;
    isUnknown():boolean;
    property():IProperty;
    id():string
    computedValue(name:string):any
    validate(acceptor:ValidationAcceptor):void
    printDetails(indent?:string):string

    getKind() : NodeKind

    getLowLevelStart()
    getLowLevelEnd()
    version();
}

export function isParseResult(object : any) : object is IParseResult {
    return object.asElement && object.getKind && object.asAttr && object.lowLevel;
}

export interface Status{
    message:string
}
export enum IssueCode{
 UNRESOLVED_REFERENCE,

 YAML_ERROR,

 UNKNOWN_NODE,

 MISSING_REQUIRED_PROPERTY,

 PROPERTY_EXPECT_TO_HAVE_SINGLE_VALUE,
 //TODO IMPLEMENT
 KEY_SHOULD_BE_UNIQUE_INTHISCONTEXT,

 UNABLE_TO_RESOLVE_INCLUDE_FILE,

 INVALID_VALUE_SCHEMA,

 MISSED_CONTEXT_REQUIREMENT,

 NODE_HAS_VALUE,

 ONLY_OVERRIDE_ALLOWED,

 ILLEGAL_PROPERTY_VALUE,

 ILLEGAL_PROPERTY,
     
 INVALID_PROPERTY
}
export interface ValidationAcceptor{
    begin()
    accept(issue: ValidationIssue);
    end();
    acceptUnique(issue: ValidationIssue);
}

/**
 * Sometimes the way we report the same error depends on the point of view:
 * which unit we consider the "primary" one.
 *
 * In example, the same application of extension to master API can be either treated
 * as a parser "opening" the extension (so extension is the primary unit), or as
 * "opening" master API and then applying extension to it (so master is the primary unit).
 *
 * In both cases the error is the same, but should be reported a bit differently.
 *
 * Thus we need to add primary unit info to the acceptor.
 */
export interface PointOfViewValidationAcceptor extends ValidationAcceptor {
    getPrimaryUnit() : lowLevel.ICompilationUnit;
}

export interface ValidationAction {
    name: string;
    action: () => void;
}

export interface ValidationIssue {
    code: string;
    message: string;
    node: IParseResult;
    path: string;
    start: number;
    end: number;
    isWarning: boolean;

    actions?: ValidationAction[];

    extras?:ValidationIssue[];
    unit?:lowLevel.ICompilationUnit;
}
export interface IStructuredValue{

    lowLevel():lowLevel.ILowLevelASTNode
    valueName():string
    toHighLevel(parent?: IHighLevelNode):IHighLevelNode;
}


export interface INodeBuilder {
    process(node: IHighLevelNode, childrenToAdopt: lowLevel.ILowLevelASTNode[]): IParseResult[];
}

export interface IAttribute extends IParseResult {

    lowLevel(): lowLevel.ILowLevelASTNode;

    definition(): IValueTypeDefinition;

    property(): IProperty;

    value(): any;
    setKey(k:string);

    setValue(newValue: string|IStructuredValue);
    setValues(values: string[]);
    addValue(value: string|IStructuredValue);

    name(): string;

    localId(): string;
    remove();

    isEmpty(): boolean;

    owningWrapper():{node:BasicNode; property:string};

    findReferencedValue():IHighLevelNode
    
    isAnnotatedScalar():boolean;

    annotations():IAttribute[];
}

export interface IHighLevelNode extends IParseResult {

    lowLevel(): lowLevel.ILowLevelASTNode;

    types():rTypes.IParsedTypeCollection;

    parsedType():rTypes.IParsedType;

    localType():typeSystem.ITypeDefinition;

    definition(): INodeDefinition;
    allowsQuestion(): boolean;
    property(): IProperty;

    children(): IParseResult[];

    attrs():IAttribute[];
    attr(n:string):IAttribute;
    attrOrCreate(n:string):IAttribute;
    attrValue(n:string):string;
    attributes(n:string):IAttribute[];
    elements():IHighLevelNode[];
    element(n:string):IHighLevelNode;

    elementsOfKind(n: string): IHighLevelNode[];
    isExpanded(): boolean;

    value(): any;

    propertiesAllowedToUse():IProperty[];
    getExpandedVersion?(): IHighLevelNode;

    add(node: IHighLevelNode|IAttribute);
    remove(node: IHighLevelNode|IAttribute);

    dump(flavor: string): string;

    findElementAtOffset(offset: number);

    root(): IHighLevelNode;

    findReferences(): IParseResult[];

    copy(): IHighLevelNode;

    resetChildren():void

    findById(id:string);


    associatedType():INodeDefinition;

    wrapperNode():BasicNode;

    setWrapperNode(node:BasicNode);

    optionalProperties():string[];

    createIssue(error: any): ValidationIssue;

    /**
     * Returns node master or null for top-level nodes.
     */
    getMaster() : IParseResult;

    /**
     * Gets whether this node is auxilary.
     */
    isAuxilary() : boolean;
}

export interface IEditableHighLevelNode extends IHighLevelNode {
    createAttr(n:string,v:string);
}

export interface IAcceptor<T> {
    calculationStarts();
    acceptProposal(c: T);
    calculationComplete();
}

export interface IStructuredValue {

    valueName(): string ;

    children():IStructuredValue[];

    lowLevel():lowLevel.ILowLevelASTNode;

    toHighLevel(parent?: IHighLevelNode):IHighLevelNode;

    toHighLevel2(parent?: IHighLevelNode):IHighLevelNode;
}