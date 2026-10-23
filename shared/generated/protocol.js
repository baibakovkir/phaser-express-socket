/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
import $protobuf from "protobufjs/minimal.js";

// Common aliases
const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
const $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

export const moba = $root.moba = (() => {

    /**
     * Namespace moba.
     * @exports moba
     * @namespace
     */
    const moba = {};

    moba.Input = (function() {

        /**
         * Properties of an Input.
         * @memberof moba
         * @interface IInput
         * @property {number|null} [seq] Input seq
         * @property {number|null} [dx] Input dx
         * @property {number|null} [dy] Input dy
         * @property {boolean|null} [attack] Input attack
         * @property {string|null} [cast] Input cast
         * @property {number|null} [targetUnit] Input targetUnit
         * @property {number|null} [aimX] Input aimX
         * @property {number|null} [aimY] Input aimY
         * @property {boolean|null} [aimed] Input aimed
         */

        /**
         * Constructs a new Input.
         * @memberof moba
         * @classdesc Represents an Input.
         * @implements IInput
         * @constructor
         * @param {moba.IInput=} [properties] Properties to set
         */
        function Input(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null && keys[i] !== "__proto__")
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Input seq.
         * @member {number} seq
         * @memberof moba.Input
         * @instance
         */
        Input.prototype.seq = 0;

        /**
         * Input dx.
         * @member {number} dx
         * @memberof moba.Input
         * @instance
         */
        Input.prototype.dx = 0;

        /**
         * Input dy.
         * @member {number} dy
         * @memberof moba.Input
         * @instance
         */
        Input.prototype.dy = 0;

        /**
         * Input attack.
         * @member {boolean} attack
         * @memberof moba.Input
         * @instance
         */
        Input.prototype.attack = false;

        /**
         * Input cast.
         * @member {string} cast
         * @memberof moba.Input
         * @instance
         */
        Input.prototype.cast = "";

        /**
         * Input targetUnit.
         * @member {number} targetUnit
         * @memberof moba.Input
         * @instance
         */
        Input.prototype.targetUnit = 0;

        /**
         * Input aimX.
         * @member {number} aimX
         * @memberof moba.Input
         * @instance
         */
        Input.prototype.aimX = 0;

        /**
         * Input aimY.
         * @member {number} aimY
         * @memberof moba.Input
         * @instance
         */
        Input.prototype.aimY = 0;

        /**
         * Input aimed.
         * @member {boolean} aimed
         * @memberof moba.Input
         * @instance
         */
        Input.prototype.aimed = false;

        /**
         * Creates a new Input instance using the specified properties.
         * @function create
         * @memberof moba.Input
         * @static
         * @param {moba.IInput=} [properties] Properties to set
         * @returns {moba.Input} Input instance
         */
        Input.create = function create(properties) {
            return new Input(properties);
        };

        /**
         * Encodes the specified Input message. Does not implicitly {@link moba.Input.verify|verify} messages.
         * @function encode
         * @memberof moba.Input
         * @static
         * @param {moba.IInput} message Input message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Input.encode = function encode(message, writer, q) {
            if (!writer)
                writer = $Writer.create();
            if (q === undefined)
                q = 0;
            if (q > $util.recursionLimit)
                throw Error("max depth exceeded");
            if (message.seq != null && Object.hasOwnProperty.call(message, "seq"))
                writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.seq);
            if (message.dx != null && Object.hasOwnProperty.call(message, "dx"))
                writer.uint32(/* id 2, wireType 0 =*/16).sint32(message.dx);
            if (message.dy != null && Object.hasOwnProperty.call(message, "dy"))
                writer.uint32(/* id 3, wireType 0 =*/24).sint32(message.dy);
            if (message.attack != null && Object.hasOwnProperty.call(message, "attack"))
                writer.uint32(/* id 4, wireType 0 =*/32).bool(message.attack);
            if (message.cast != null && Object.hasOwnProperty.call(message, "cast"))
                writer.uint32(/* id 5, wireType 2 =*/42).string(message.cast);
            if (message.targetUnit != null && Object.hasOwnProperty.call(message, "targetUnit"))
                writer.uint32(/* id 6, wireType 0 =*/48).uint32(message.targetUnit);
            if (message.aimX != null && Object.hasOwnProperty.call(message, "aimX"))
                writer.uint32(/* id 7, wireType 0 =*/56).sint32(message.aimX);
            if (message.aimY != null && Object.hasOwnProperty.call(message, "aimY"))
                writer.uint32(/* id 8, wireType 0 =*/64).sint32(message.aimY);
            if (message.aimed != null && Object.hasOwnProperty.call(message, "aimed"))
                writer.uint32(/* id 9, wireType 0 =*/72).bool(message.aimed);
            return writer;
        };

        /**
         * Encodes the specified Input message, length delimited. Does not implicitly {@link moba.Input.verify|verify} messages.
         * @function encodeDelimited
         * @memberof moba.Input
         * @static
         * @param {moba.IInput} message Input message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Input.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
        };

        /**
         * Decodes an Input message from the specified reader or buffer.
         * @function decode
         * @memberof moba.Input
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {moba.Input} Input
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Input.decode = function decode(reader, length, error, long) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            if (long === undefined)
                long = 0;
            if (long > $Reader.recursionLimit)
                throw Error("maximum nesting depth exceeded");
            let end, message;
            if (length === undefined)
                end = reader.len;
            else {
                end = reader.pos + length;
                if (end > reader.len)
                    throw RangeError("index out of range");
                length = reader.len;
                reader.len = end;
            }
            message = new $root.moba.Input();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.seq = reader.uint32();
                        break;
                    }
                case 2: {
                        message.dx = reader.sint32();
                        break;
                    }
                case 3: {
                        message.dy = reader.sint32();
                        break;
                    }
                case 4: {
                        message.attack = reader.bool();
                        break;
                    }
                case 5: {
                        message.cast = reader.string();
                        break;
                    }
                case 6: {
                        message.targetUnit = reader.uint32();
                        break;
                    }
                case 7: {
                        message.aimX = reader.sint32();
                        break;
                    }
                case 8: {
                        message.aimY = reader.sint32();
                        break;
                    }
                case 9: {
                        message.aimed = reader.bool();
                        break;
                    }
                default:
                    reader.skipType(tag & 7, long);
                    break;
                }
            }
            if (length !== undefined) {
                if (reader.pos !== end)
                    throw RangeError("index out of range");
                reader.len = length;
            }
            return message;
        };

        /**
         * Decodes an Input message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof moba.Input
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {moba.Input} Input
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Input.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an Input message.
         * @function verify
         * @memberof moba.Input
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Input.verify = function verify(message, long) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (long === undefined)
                long = 0;
            if (long > $util.recursionLimit)
                return "maximum nesting depth exceeded";
            if (message.seq != null && Object.hasOwnProperty.call(message, "seq"))
                if (!$util.isInteger(message.seq))
                    return "seq: integer expected";
            if (message.dx != null && Object.hasOwnProperty.call(message, "dx"))
                if (!$util.isInteger(message.dx))
                    return "dx: integer expected";
            if (message.dy != null && Object.hasOwnProperty.call(message, "dy"))
                if (!$util.isInteger(message.dy))
                    return "dy: integer expected";
            if (message.attack != null && Object.hasOwnProperty.call(message, "attack"))
                if (typeof message.attack !== "boolean")
                    return "attack: boolean expected";
            if (message.cast != null && Object.hasOwnProperty.call(message, "cast"))
                if (!$util.isString(message.cast))
                    return "cast: string expected";
            if (message.targetUnit != null && Object.hasOwnProperty.call(message, "targetUnit"))
                if (!$util.isInteger(message.targetUnit))
                    return "targetUnit: integer expected";
            if (message.aimX != null && Object.hasOwnProperty.call(message, "aimX"))
                if (!$util.isInteger(message.aimX))
                    return "aimX: integer expected";
            if (message.aimY != null && Object.hasOwnProperty.call(message, "aimY"))
                if (!$util.isInteger(message.aimY))
                    return "aimY: integer expected";
            if (message.aimed != null && Object.hasOwnProperty.call(message, "aimed"))
                if (typeof message.aimed !== "boolean")
                    return "aimed: boolean expected";
            return null;
        };

        /**
         * Creates an Input message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof moba.Input
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {moba.Input} Input
         */
        Input.fromObject = function fromObject(object, long) {
            if (object instanceof $root.moba.Input)
                return object;
            if (!$util.isObject(object))
                throw TypeError(".moba.Input: object expected");
            if (long === undefined)
                long = 0;
            if (long > $util.recursionLimit)
                throw Error("maximum nesting depth exceeded");
            let message = new $root.moba.Input();
            if (object.seq != null)
                message.seq = object.seq >>> 0;
            if (object.dx != null)
                message.dx = object.dx | 0;
            if (object.dy != null)
                message.dy = object.dy | 0;
            if (object.attack != null)
                message.attack = Boolean(object.attack);
            if (object.cast != null)
                message.cast = String(object.cast);
            if (object.targetUnit != null)
                message.targetUnit = object.targetUnit >>> 0;
            if (object.aimX != null)
                message.aimX = object.aimX | 0;
            if (object.aimY != null)
                message.aimY = object.aimY | 0;
            if (object.aimed != null)
                message.aimed = Boolean(object.aimed);
            return message;
        };

        /**
         * Creates a plain object from an Input message. Also converts values to other types if specified.
         * @function toObject
         * @memberof moba.Input
         * @static
         * @param {moba.Input} message Input
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Input.toObject = function toObject(message, options, q) {
            if (!options)
                options = {};
            if (q === undefined)
                q = 0;
            if (q > $util.recursionLimit)
                throw Error("max depth exceeded");
            let object = {};
            if (options.defaults) {
                object.seq = 0;
                object.dx = 0;
                object.dy = 0;
                object.attack = false;
                object.cast = "";
                object.targetUnit = 0;
                object.aimX = 0;
                object.aimY = 0;
                object.aimed = false;
            }
            if (message.seq != null && Object.hasOwnProperty.call(message, "seq"))
                object.seq = message.seq;
            if (message.dx != null && Object.hasOwnProperty.call(message, "dx"))
                object.dx = message.dx;
            if (message.dy != null && Object.hasOwnProperty.call(message, "dy"))
                object.dy = message.dy;
            if (message.attack != null && Object.hasOwnProperty.call(message, "attack"))
                object.attack = message.attack;
            if (message.cast != null && Object.hasOwnProperty.call(message, "cast"))
                object.cast = message.cast;
            if (message.targetUnit != null && Object.hasOwnProperty.call(message, "targetUnit"))
                object.targetUnit = message.targetUnit;
            if (message.aimX != null && Object.hasOwnProperty.call(message, "aimX"))
                object.aimX = message.aimX;
            if (message.aimY != null && Object.hasOwnProperty.call(message, "aimY"))
                object.aimY = message.aimY;
            if (message.aimed != null && Object.hasOwnProperty.call(message, "aimed"))
                object.aimed = message.aimed;
            return object;
        };

        /**
         * Converts this Input to JSON.
         * @function toJSON
         * @memberof moba.Input
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Input.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Input
         * @function getTypeUrl
         * @memberof moba.Input
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Input.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/moba.Input";
        };

        return Input;
    })();

    moba.Effect = (function() {

        /**
         * Properties of an Effect.
         * @memberof moba
         * @interface IEffect
         * @property {number|null} [id] Effect id
         * @property {number|null} [caster] Effect caster
         * @property {string|null} [kind] Effect kind
         * @property {number|null} [x] Effect x
         * @property {number|null} [y] Effect y
         * @property {number|null} [target] Effect target
         * @property {number|null} [tick] Effect tick
         * @property {number|null} [sourceUnit] Effect sourceUnit
         * @property {number|null} [amount] Effect amount
         * @property {string|null} [abilityKey] Effect abilityKey
         * @property {number|null} [originX] Effect originX
         * @property {number|null} [originY] Effect originY
         * @property {boolean|null} [hasOrigin] Effect hasOrigin
         */

        /**
         * Constructs a new Effect.
         * @memberof moba
         * @classdesc Represents an Effect.
         * @implements IEffect
         * @constructor
         * @param {moba.IEffect=} [properties] Properties to set
         */
        function Effect(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null && keys[i] !== "__proto__")
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Effect id.
         * @member {number} id
         * @memberof moba.Effect
         * @instance
         */
        Effect.prototype.id = 0;

        /**
         * Effect caster.
         * @member {number} caster
         * @memberof moba.Effect
         * @instance
         */
        Effect.prototype.caster = 0;

        /**
         * Effect kind.
         * @member {string} kind
         * @memberof moba.Effect
         * @instance
         */
        Effect.prototype.kind = "";

        /**
         * Effect x.
         * @member {number} x
         * @memberof moba.Effect
         * @instance
         */
        Effect.prototype.x = 0;

        /**
         * Effect y.
         * @member {number} y
         * @memberof moba.Effect
         * @instance
         */
        Effect.prototype.y = 0;

        /**
         * Effect target.
         * @member {number} target
         * @memberof moba.Effect
         * @instance
         */
        Effect.prototype.target = 0;

        /**
         * Effect tick.
         * @member {number} tick
         * @memberof moba.Effect
         * @instance
         */
        Effect.prototype.tick = 0;

        /**
         * Effect sourceUnit.
         * @member {number} sourceUnit
         * @memberof moba.Effect
         * @instance
         */
        Effect.prototype.sourceUnit = 0;

        /**
         * Effect amount.
         * @member {number} amount
         * @memberof moba.Effect
         * @instance
         */
        Effect.prototype.amount = 0;

        /**
         * Effect abilityKey.
         * @member {string} abilityKey
         * @memberof moba.Effect
         * @instance
         */
        Effect.prototype.abilityKey = "";

        /**
         * Effect originX.
         * @member {number} originX
         * @memberof moba.Effect
         * @instance
         */
        Effect.prototype.originX = 0;

        /**
         * Effect originY.
         * @member {number} originY
         * @memberof moba.Effect
         * @instance
         */
        Effect.prototype.originY = 0;

        /**
         * Effect hasOrigin.
         * @member {boolean} hasOrigin
         * @memberof moba.Effect
         * @instance
         */
        Effect.prototype.hasOrigin = false;

        /**
         * Creates a new Effect instance using the specified properties.
         * @function create
         * @memberof moba.Effect
         * @static
         * @param {moba.IEffect=} [properties] Properties to set
         * @returns {moba.Effect} Effect instance
         */
        Effect.create = function create(properties) {
            return new Effect(properties);
        };

        /**
         * Encodes the specified Effect message. Does not implicitly {@link moba.Effect.verify|verify} messages.
         * @function encode
         * @memberof moba.Effect
         * @static
         * @param {moba.IEffect} message Effect message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Effect.encode = function encode(message, writer, q) {
            if (!writer)
                writer = $Writer.create();
            if (q === undefined)
                q = 0;
            if (q > $util.recursionLimit)
                throw Error("max depth exceeded");
            if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.id);
            if (message.caster != null && Object.hasOwnProperty.call(message, "caster"))
                writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.caster);
            if (message.kind != null && Object.hasOwnProperty.call(message, "kind"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.kind);
            if (message.x != null && Object.hasOwnProperty.call(message, "x"))
                writer.uint32(/* id 4, wireType 0 =*/32).sint32(message.x);
            if (message.y != null && Object.hasOwnProperty.call(message, "y"))
                writer.uint32(/* id 5, wireType 0 =*/40).sint32(message.y);
            if (message.target != null && Object.hasOwnProperty.call(message, "target"))
                writer.uint32(/* id 6, wireType 0 =*/48).uint32(message.target);
            if (message.tick != null && Object.hasOwnProperty.call(message, "tick"))
                writer.uint32(/* id 7, wireType 0 =*/56).uint32(message.tick);
            if (message.sourceUnit != null && Object.hasOwnProperty.call(message, "sourceUnit"))
                writer.uint32(/* id 8, wireType 0 =*/64).uint32(message.sourceUnit);
            if (message.amount != null && Object.hasOwnProperty.call(message, "amount"))
                writer.uint32(/* id 9, wireType 0 =*/72).uint32(message.amount);
            if (message.abilityKey != null && Object.hasOwnProperty.call(message, "abilityKey"))
                writer.uint32(/* id 10, wireType 2 =*/82).string(message.abilityKey);
            if (message.originX != null && Object.hasOwnProperty.call(message, "originX"))
                writer.uint32(/* id 11, wireType 0 =*/88).sint32(message.originX);
            if (message.originY != null && Object.hasOwnProperty.call(message, "originY"))
                writer.uint32(/* id 12, wireType 0 =*/96).sint32(message.originY);
            if (message.hasOrigin != null && Object.hasOwnProperty.call(message, "hasOrigin"))
                writer.uint32(/* id 13, wireType 0 =*/104).bool(message.hasOrigin);
            return writer;
        };

        /**
         * Encodes the specified Effect message, length delimited. Does not implicitly {@link moba.Effect.verify|verify} messages.
         * @function encodeDelimited
         * @memberof moba.Effect
         * @static
         * @param {moba.IEffect} message Effect message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Effect.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
        };

        /**
         * Decodes an Effect message from the specified reader or buffer.
         * @function decode
         * @memberof moba.Effect
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {moba.Effect} Effect
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Effect.decode = function decode(reader, length, error, long) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            if (long === undefined)
                long = 0;
            if (long > $Reader.recursionLimit)
                throw Error("maximum nesting depth exceeded");
            let end, message;
            if (length === undefined)
                end = reader.len;
            else {
                end = reader.pos + length;
                if (end > reader.len)
                    throw RangeError("index out of range");
                length = reader.len;
                reader.len = end;
            }
            message = new $root.moba.Effect();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.id = reader.uint32();
                        break;
                    }
                case 2: {
                        message.caster = reader.uint32();
                        break;
                    }
                case 3: {
                        message.kind = reader.string();
                        break;
                    }
                case 4: {
                        message.x = reader.sint32();
                        break;
                    }
                case 5: {
                        message.y = reader.sint32();
                        break;
                    }
                case 6: {
                        message.target = reader.uint32();
                        break;
                    }
                case 7: {
                        message.tick = reader.uint32();
                        break;
                    }
                case 8: {
                        message.sourceUnit = reader.uint32();
                        break;
                    }
                case 9: {
                        message.amount = reader.uint32();
                        break;
                    }
                case 10: {
                        message.abilityKey = reader.string();
                        break;
                    }
                case 11: {
                        message.originX = reader.sint32();
                        break;
                    }
                case 12: {
                        message.originY = reader.sint32();
                        break;
                    }
                case 13: {
                        message.hasOrigin = reader.bool();
                        break;
                    }
                default:
                    reader.skipType(tag & 7, long);
                    break;
                }
            }
            if (length !== undefined) {
                if (reader.pos !== end)
                    throw RangeError("index out of range");
                reader.len = length;
            }
            return message;
        };

        /**
         * Decodes an Effect message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof moba.Effect
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {moba.Effect} Effect
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Effect.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an Effect message.
         * @function verify
         * @memberof moba.Effect
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Effect.verify = function verify(message, long) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (long === undefined)
                long = 0;
            if (long > $util.recursionLimit)
                return "maximum nesting depth exceeded";
            if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                if (!$util.isInteger(message.id))
                    return "id: integer expected";
            if (message.caster != null && Object.hasOwnProperty.call(message, "caster"))
                if (!$util.isInteger(message.caster))
                    return "caster: integer expected";
            if (message.kind != null && Object.hasOwnProperty.call(message, "kind"))
                if (!$util.isString(message.kind))
                    return "kind: string expected";
            if (message.x != null && Object.hasOwnProperty.call(message, "x"))
                if (!$util.isInteger(message.x))
                    return "x: integer expected";
            if (message.y != null && Object.hasOwnProperty.call(message, "y"))
                if (!$util.isInteger(message.y))
                    return "y: integer expected";
            if (message.target != null && Object.hasOwnProperty.call(message, "target"))
                if (!$util.isInteger(message.target))
                    return "target: integer expected";
            if (message.tick != null && Object.hasOwnProperty.call(message, "tick"))
                if (!$util.isInteger(message.tick))
                    return "tick: integer expected";
            if (message.sourceUnit != null && Object.hasOwnProperty.call(message, "sourceUnit"))
                if (!$util.isInteger(message.sourceUnit))
                    return "sourceUnit: integer expected";
            if (message.amount != null && Object.hasOwnProperty.call(message, "amount"))
                if (!$util.isInteger(message.amount))
                    return "amount: integer expected";
            if (message.abilityKey != null && Object.hasOwnProperty.call(message, "abilityKey"))
                if (!$util.isString(message.abilityKey))
                    return "abilityKey: string expected";
            if (message.originX != null && Object.hasOwnProperty.call(message, "originX"))
                if (!$util.isInteger(message.originX))
                    return "originX: integer expected";
            if (message.originY != null && Object.hasOwnProperty.call(message, "originY"))
                if (!$util.isInteger(message.originY))
                    return "originY: integer expected";
            if (message.hasOrigin != null && Object.hasOwnProperty.call(message, "hasOrigin"))
                if (typeof message.hasOrigin !== "boolean")
                    return "hasOrigin: boolean expected";
            return null;
        };

        /**
         * Creates an Effect message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof moba.Effect
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {moba.Effect} Effect
         */
        Effect.fromObject = function fromObject(object, long) {
            if (object instanceof $root.moba.Effect)
                return object;
            if (!$util.isObject(object))
                throw TypeError(".moba.Effect: object expected");
            if (long === undefined)
                long = 0;
            if (long > $util.recursionLimit)
                throw Error("maximum nesting depth exceeded");
            let message = new $root.moba.Effect();
            if (object.id != null)
                message.id = object.id >>> 0;
            if (object.caster != null)
                message.caster = object.caster >>> 0;
            if (object.kind != null)
                message.kind = String(object.kind);
            if (object.x != null)
                message.x = object.x | 0;
            if (object.y != null)
                message.y = object.y | 0;
            if (object.target != null)
                message.target = object.target >>> 0;
            if (object.tick != null)
                message.tick = object.tick >>> 0;
            if (object.sourceUnit != null)
                message.sourceUnit = object.sourceUnit >>> 0;
            if (object.amount != null)
                message.amount = object.amount >>> 0;
            if (object.abilityKey != null)
                message.abilityKey = String(object.abilityKey);
            if (object.originX != null)
                message.originX = object.originX | 0;
            if (object.originY != null)
                message.originY = object.originY | 0;
            if (object.hasOrigin != null)
                message.hasOrigin = Boolean(object.hasOrigin);
            return message;
        };

        /**
         * Creates a plain object from an Effect message. Also converts values to other types if specified.
         * @function toObject
         * @memberof moba.Effect
         * @static
         * @param {moba.Effect} message Effect
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Effect.toObject = function toObject(message, options, q) {
            if (!options)
                options = {};
            if (q === undefined)
                q = 0;
            if (q > $util.recursionLimit)
                throw Error("max depth exceeded");
            let object = {};
            if (options.defaults) {
                object.id = 0;
                object.caster = 0;
                object.kind = "";
                object.x = 0;
                object.y = 0;
                object.target = 0;
                object.tick = 0;
                object.sourceUnit = 0;
                object.amount = 0;
                object.abilityKey = "";
                object.originX = 0;
                object.originY = 0;
                object.hasOrigin = false;
            }
            if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                object.id = message.id;
            if (message.caster != null && Object.hasOwnProperty.call(message, "caster"))
                object.caster = message.caster;
            if (message.kind != null && Object.hasOwnProperty.call(message, "kind"))
                object.kind = message.kind;
            if (message.x != null && Object.hasOwnProperty.call(message, "x"))
                object.x = message.x;
            if (message.y != null && Object.hasOwnProperty.call(message, "y"))
                object.y = message.y;
            if (message.target != null && Object.hasOwnProperty.call(message, "target"))
                object.target = message.target;
            if (message.tick != null && Object.hasOwnProperty.call(message, "tick"))
                object.tick = message.tick;
            if (message.sourceUnit != null && Object.hasOwnProperty.call(message, "sourceUnit"))
                object.sourceUnit = message.sourceUnit;
            if (message.amount != null && Object.hasOwnProperty.call(message, "amount"))
                object.amount = message.amount;
            if (message.abilityKey != null && Object.hasOwnProperty.call(message, "abilityKey"))
                object.abilityKey = message.abilityKey;
            if (message.originX != null && Object.hasOwnProperty.call(message, "originX"))
                object.originX = message.originX;
            if (message.originY != null && Object.hasOwnProperty.call(message, "originY"))
                object.originY = message.originY;
            if (message.hasOrigin != null && Object.hasOwnProperty.call(message, "hasOrigin"))
                object.hasOrigin = message.hasOrigin;
            return object;
        };

        /**
         * Converts this Effect to JSON.
         * @function toJSON
         * @memberof moba.Effect
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Effect.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Effect
         * @function getTypeUrl
         * @memberof moba.Effect
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Effect.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/moba.Effect";
        };

        return Effect;
    })();

    moba.Unit = (function() {

        /**
         * Properties of an Unit.
         * @memberof moba
         * @interface IUnit
         * @property {number|null} [id] Unit id
         * @property {number|null} [kind] Unit kind
         * @property {number|null} [team] Unit team
         * @property {number|null} [lane] Unit lane
         * @property {number|null} [x] Unit x
         * @property {number|null} [y] Unit y
         * @property {number|null} [hp] Unit hp
         * @property {number|null} [maxHp] Unit maxHp
         */

        /**
         * Constructs a new Unit.
         * @memberof moba
         * @classdesc Represents an Unit.
         * @implements IUnit
         * @constructor
         * @param {moba.IUnit=} [properties] Properties to set
         */
        function Unit(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null && keys[i] !== "__proto__")
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Unit id.
         * @member {number} id
         * @memberof moba.Unit
         * @instance
         */
        Unit.prototype.id = 0;

        /**
         * Unit kind.
         * @member {number} kind
         * @memberof moba.Unit
         * @instance
         */
        Unit.prototype.kind = 0;

        /**
         * Unit team.
         * @member {number} team
         * @memberof moba.Unit
         * @instance
         */
        Unit.prototype.team = 0;

        /**
         * Unit lane.
         * @member {number} lane
         * @memberof moba.Unit
         * @instance
         */
        Unit.prototype.lane = 0;

        /**
         * Unit x.
         * @member {number} x
         * @memberof moba.Unit
         * @instance
         */
        Unit.prototype.x = 0;

        /**
         * Unit y.
         * @member {number} y
         * @memberof moba.Unit
         * @instance
         */
        Unit.prototype.y = 0;

        /**
         * Unit hp.
         * @member {number} hp
         * @memberof moba.Unit
         * @instance
         */
        Unit.prototype.hp = 0;

        /**
         * Unit maxHp.
         * @member {number} maxHp
         * @memberof moba.Unit
         * @instance
         */
        Unit.prototype.maxHp = 0;

        /**
         * Creates a new Unit instance using the specified properties.
         * @function create
         * @memberof moba.Unit
         * @static
         * @param {moba.IUnit=} [properties] Properties to set
         * @returns {moba.Unit} Unit instance
         */
        Unit.create = function create(properties) {
            return new Unit(properties);
        };

        /**
         * Encodes the specified Unit message. Does not implicitly {@link moba.Unit.verify|verify} messages.
         * @function encode
         * @memberof moba.Unit
         * @static
         * @param {moba.IUnit} message Unit message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Unit.encode = function encode(message, writer, q) {
            if (!writer)
                writer = $Writer.create();
            if (q === undefined)
                q = 0;
            if (q > $util.recursionLimit)
                throw Error("max depth exceeded");
            if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.id);
            if (message.kind != null && Object.hasOwnProperty.call(message, "kind"))
                writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.kind);
            if (message.team != null && Object.hasOwnProperty.call(message, "team"))
                writer.uint32(/* id 3, wireType 0 =*/24).uint32(message.team);
            if (message.lane != null && Object.hasOwnProperty.call(message, "lane"))
                writer.uint32(/* id 4, wireType 0 =*/32).uint32(message.lane);
            if (message.x != null && Object.hasOwnProperty.call(message, "x"))
                writer.uint32(/* id 5, wireType 0 =*/40).sint32(message.x);
            if (message.y != null && Object.hasOwnProperty.call(message, "y"))
                writer.uint32(/* id 6, wireType 0 =*/48).sint32(message.y);
            if (message.hp != null && Object.hasOwnProperty.call(message, "hp"))
                writer.uint32(/* id 7, wireType 0 =*/56).uint32(message.hp);
            if (message.maxHp != null && Object.hasOwnProperty.call(message, "maxHp"))
                writer.uint32(/* id 8, wireType 0 =*/64).uint32(message.maxHp);
            return writer;
        };

        /**
         * Encodes the specified Unit message, length delimited. Does not implicitly {@link moba.Unit.verify|verify} messages.
         * @function encodeDelimited
         * @memberof moba.Unit
         * @static
         * @param {moba.IUnit} message Unit message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Unit.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
        };

        /**
         * Decodes an Unit message from the specified reader or buffer.
         * @function decode
         * @memberof moba.Unit
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {moba.Unit} Unit
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Unit.decode = function decode(reader, length, error, long) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            if (long === undefined)
                long = 0;
            if (long > $Reader.recursionLimit)
                throw Error("maximum nesting depth exceeded");
            let end, message;
            if (length === undefined)
                end = reader.len;
            else {
                end = reader.pos + length;
                if (end > reader.len)
                    throw RangeError("index out of range");
                length = reader.len;
                reader.len = end;
            }
            message = new $root.moba.Unit();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.id = reader.uint32();
                        break;
                    }
                case 2: {
                        message.kind = reader.uint32();
                        break;
                    }
                case 3: {
                        message.team = reader.uint32();
                        break;
                    }
                case 4: {
                        message.lane = reader.uint32();
                        break;
                    }
                case 5: {
                        message.x = reader.sint32();
                        break;
                    }
                case 6: {
                        message.y = reader.sint32();
                        break;
                    }
                case 7: {
                        message.hp = reader.uint32();
                        break;
                    }
                case 8: {
                        message.maxHp = reader.uint32();
                        break;
                    }
                default:
                    reader.skipType(tag & 7, long);
                    break;
                }
            }
            if (length !== undefined) {
                if (reader.pos !== end)
                    throw RangeError("index out of range");
                reader.len = length;
            }
            return message;
        };

        /**
         * Decodes an Unit message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof moba.Unit
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {moba.Unit} Unit
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Unit.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an Unit message.
         * @function verify
         * @memberof moba.Unit
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Unit.verify = function verify(message, long) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (long === undefined)
                long = 0;
            if (long > $util.recursionLimit)
                return "maximum nesting depth exceeded";
            if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                if (!$util.isInteger(message.id))
                    return "id: integer expected";
            if (message.kind != null && Object.hasOwnProperty.call(message, "kind"))
                if (!$util.isInteger(message.kind))
                    return "kind: integer expected";
            if (message.team != null && Object.hasOwnProperty.call(message, "team"))
                if (!$util.isInteger(message.team))
                    return "team: integer expected";
            if (message.lane != null && Object.hasOwnProperty.call(message, "lane"))
                if (!$util.isInteger(message.lane))
                    return "lane: integer expected";
            if (message.x != null && Object.hasOwnProperty.call(message, "x"))
                if (!$util.isInteger(message.x))
                    return "x: integer expected";
            if (message.y != null && Object.hasOwnProperty.call(message, "y"))
                if (!$util.isInteger(message.y))
                    return "y: integer expected";
            if (message.hp != null && Object.hasOwnProperty.call(message, "hp"))
                if (!$util.isInteger(message.hp))
                    return "hp: integer expected";
            if (message.maxHp != null && Object.hasOwnProperty.call(message, "maxHp"))
                if (!$util.isInteger(message.maxHp))
                    return "maxHp: integer expected";
            return null;
        };

        /**
         * Creates an Unit message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof moba.Unit
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {moba.Unit} Unit
         */
        Unit.fromObject = function fromObject(object, long) {
            if (object instanceof $root.moba.Unit)
                return object;
            if (!$util.isObject(object))
                throw TypeError(".moba.Unit: object expected");
            if (long === undefined)
                long = 0;
            if (long > $util.recursionLimit)
                throw Error("maximum nesting depth exceeded");
            let message = new $root.moba.Unit();
            if (object.id != null)
                message.id = object.id >>> 0;
            if (object.kind != null)
                message.kind = object.kind >>> 0;
            if (object.team != null)
                message.team = object.team >>> 0;
            if (object.lane != null)
                message.lane = object.lane >>> 0;
            if (object.x != null)
                message.x = object.x | 0;
            if (object.y != null)
                message.y = object.y | 0;
            if (object.hp != null)
                message.hp = object.hp >>> 0;
            if (object.maxHp != null)
                message.maxHp = object.maxHp >>> 0;
            return message;
        };

        /**
         * Creates a plain object from an Unit message. Also converts values to other types if specified.
         * @function toObject
         * @memberof moba.Unit
         * @static
         * @param {moba.Unit} message Unit
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Unit.toObject = function toObject(message, options, q) {
            if (!options)
                options = {};
            if (q === undefined)
                q = 0;
            if (q > $util.recursionLimit)
                throw Error("max depth exceeded");
            let object = {};
            if (options.defaults) {
                object.id = 0;
                object.kind = 0;
                object.team = 0;
                object.lane = 0;
                object.x = 0;
                object.y = 0;
                object.hp = 0;
                object.maxHp = 0;
            }
            if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                object.id = message.id;
            if (message.kind != null && Object.hasOwnProperty.call(message, "kind"))
                object.kind = message.kind;
            if (message.team != null && Object.hasOwnProperty.call(message, "team"))
                object.team = message.team;
            if (message.lane != null && Object.hasOwnProperty.call(message, "lane"))
                object.lane = message.lane;
            if (message.x != null && Object.hasOwnProperty.call(message, "x"))
                object.x = message.x;
            if (message.y != null && Object.hasOwnProperty.call(message, "y"))
                object.y = message.y;
            if (message.hp != null && Object.hasOwnProperty.call(message, "hp"))
                object.hp = message.hp;
            if (message.maxHp != null && Object.hasOwnProperty.call(message, "maxHp"))
                object.maxHp = message.maxHp;
            return object;
        };

        /**
         * Converts this Unit to JSON.
         * @function toJSON
         * @memberof moba.Unit
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Unit.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Unit
         * @function getTypeUrl
         * @memberof moba.Unit
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Unit.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/moba.Unit";
        };

        return Unit;
    })();

    moba.PlayerState = (function() {

        /**
         * Properties of a PlayerState.
         * @memberof moba
         * @interface IPlayerState
         * @property {number|null} [index] PlayerState index
         * @property {number|null} [x] PlayerState x
         * @property {number|null} [y] PlayerState y
         * @property {number|null} [hp] PlayerState hp
         * @property {number|null} [maxHp] PlayerState maxHp
         * @property {number|null} [mana] PlayerState mana
         * @property {number|null} [maxMana] PlayerState maxMana
         * @property {number|null} [speed] PlayerState speed
         * @property {number|null} [kills] PlayerState kills
         * @property {number|null} [deaths] PlayerState deaths
         * @property {number|null} [lastProcessedSeq] PlayerState lastProcessedSeq
         * @property {string|null} [heroId] PlayerState heroId
         * @property {number|null} [gold] PlayerState gold
         * @property {number|null} [goldEarned] PlayerState goldEarned
         * @property {number|null} [lastHits] PlayerState lastHits
         * @property {number|null} [assists] PlayerState assists
         * @property {Array.<moba.IInventorySlot>|null} [inventory] PlayerState inventory
         * @property {Array.<number>|null} [abilityReadyTicks] PlayerState abilityReadyTicks
         */

        /**
         * Constructs a new PlayerState.
         * @memberof moba
         * @classdesc Represents a PlayerState.
         * @implements IPlayerState
         * @constructor
         * @param {moba.IPlayerState=} [properties] Properties to set
         */
        function PlayerState(properties) {
            this.inventory = [];
            this.abilityReadyTicks = [];
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null && keys[i] !== "__proto__")
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * PlayerState index.
         * @member {number} index
         * @memberof moba.PlayerState
         * @instance
         */
        PlayerState.prototype.index = 0;

        /**
         * PlayerState x.
         * @member {number} x
         * @memberof moba.PlayerState
         * @instance
         */
        PlayerState.prototype.x = 0;

        /**
         * PlayerState y.
         * @member {number} y
         * @memberof moba.PlayerState
         * @instance
         */
        PlayerState.prototype.y = 0;

        /**
         * PlayerState hp.
         * @member {number} hp
         * @memberof moba.PlayerState
         * @instance
         */
        PlayerState.prototype.hp = 0;

        /**
         * PlayerState maxHp.
         * @member {number} maxHp
         * @memberof moba.PlayerState
         * @instance
         */
        PlayerState.prototype.maxHp = 0;

        /**
         * PlayerState mana.
         * @member {number} mana
         * @memberof moba.PlayerState
         * @instance
         */
        PlayerState.prototype.mana = 0;

        /**
         * PlayerState maxMana.
         * @member {number} maxMana
         * @memberof moba.PlayerState
         * @instance
         */
        PlayerState.prototype.maxMana = 0;

        /**
         * PlayerState speed.
         * @member {number} speed
         * @memberof moba.PlayerState
         * @instance
         */
        PlayerState.prototype.speed = 0;

        /**
         * PlayerState kills.
         * @member {number} kills
         * @memberof moba.PlayerState
         * @instance
         */
        PlayerState.prototype.kills = 0;

        /**
         * PlayerState deaths.
         * @member {number} deaths
         * @memberof moba.PlayerState
         * @instance
         */
        PlayerState.prototype.deaths = 0;

        /**
         * PlayerState lastProcessedSeq.
         * @member {number} lastProcessedSeq
         * @memberof moba.PlayerState
         * @instance
         */
        PlayerState.prototype.lastProcessedSeq = 0;

        /**
         * PlayerState heroId.
         * @member {string} heroId
         * @memberof moba.PlayerState
         * @instance
         */
        PlayerState.prototype.heroId = "";

        /**
         * PlayerState gold.
         * @member {number} gold
         * @memberof moba.PlayerState
         * @instance
         */
        PlayerState.prototype.gold = 0;

        /**
         * PlayerState goldEarned.
         * @member {number} goldEarned
         * @memberof moba.PlayerState
         * @instance
         */
        PlayerState.prototype.goldEarned = 0;

        /**
         * PlayerState lastHits.
         * @member {number} lastHits
         * @memberof moba.PlayerState
         * @instance
         */
        PlayerState.prototype.lastHits = 0;

        /**
         * PlayerState assists.
         * @member {number} assists
         * @memberof moba.PlayerState
         * @instance
         */
        PlayerState.prototype.assists = 0;

        /**
         * PlayerState inventory.
         * @member {Array.<moba.IInventorySlot>} inventory
         * @memberof moba.PlayerState
         * @instance
         */
        PlayerState.prototype.inventory = $util.emptyArray;

        /**
         * PlayerState abilityReadyTicks.
         * @member {Array.<number>} abilityReadyTicks
         * @memberof moba.PlayerState
         * @instance
         */
        PlayerState.prototype.abilityReadyTicks = $util.emptyArray;

        /**
         * Creates a new PlayerState instance using the specified properties.
         * @function create
         * @memberof moba.PlayerState
         * @static
         * @param {moba.IPlayerState=} [properties] Properties to set
         * @returns {moba.PlayerState} PlayerState instance
         */
        PlayerState.create = function create(properties) {
            return new PlayerState(properties);
        };

        /**
         * Encodes the specified PlayerState message. Does not implicitly {@link moba.PlayerState.verify|verify} messages.
         * @function encode
         * @memberof moba.PlayerState
         * @static
         * @param {moba.IPlayerState} message PlayerState message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PlayerState.encode = function encode(message, writer, q) {
            if (!writer)
                writer = $Writer.create();
            if (q === undefined)
                q = 0;
            if (q > $util.recursionLimit)
                throw Error("max depth exceeded");
            if (message.index != null && Object.hasOwnProperty.call(message, "index"))
                writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.index);
            if (message.x != null && Object.hasOwnProperty.call(message, "x"))
                writer.uint32(/* id 2, wireType 0 =*/16).sint32(message.x);
            if (message.y != null && Object.hasOwnProperty.call(message, "y"))
                writer.uint32(/* id 3, wireType 0 =*/24).sint32(message.y);
            if (message.hp != null && Object.hasOwnProperty.call(message, "hp"))
                writer.uint32(/* id 4, wireType 0 =*/32).uint32(message.hp);
            if (message.maxHp != null && Object.hasOwnProperty.call(message, "maxHp"))
                writer.uint32(/* id 5, wireType 0 =*/40).uint32(message.maxHp);
            if (message.mana != null && Object.hasOwnProperty.call(message, "mana"))
                writer.uint32(/* id 6, wireType 0 =*/48).uint32(message.mana);
            if (message.maxMana != null && Object.hasOwnProperty.call(message, "maxMana"))
                writer.uint32(/* id 7, wireType 0 =*/56).uint32(message.maxMana);
            if (message.speed != null && Object.hasOwnProperty.call(message, "speed"))
                writer.uint32(/* id 8, wireType 0 =*/64).uint32(message.speed);
            if (message.kills != null && Object.hasOwnProperty.call(message, "kills"))
                writer.uint32(/* id 9, wireType 0 =*/72).uint32(message.kills);
            if (message.deaths != null && Object.hasOwnProperty.call(message, "deaths"))
                writer.uint32(/* id 10, wireType 0 =*/80).uint32(message.deaths);
            if (message.lastProcessedSeq != null && Object.hasOwnProperty.call(message, "lastProcessedSeq"))
                writer.uint32(/* id 11, wireType 0 =*/88).uint32(message.lastProcessedSeq);
            if (message.heroId != null && Object.hasOwnProperty.call(message, "heroId"))
                writer.uint32(/* id 12, wireType 2 =*/98).string(message.heroId);
            if (message.gold != null && Object.hasOwnProperty.call(message, "gold"))
                writer.uint32(/* id 13, wireType 0 =*/104).uint32(message.gold);
            if (message.goldEarned != null && Object.hasOwnProperty.call(message, "goldEarned"))
                writer.uint32(/* id 14, wireType 0 =*/112).uint32(message.goldEarned);
            if (message.lastHits != null && Object.hasOwnProperty.call(message, "lastHits"))
                writer.uint32(/* id 15, wireType 0 =*/120).uint32(message.lastHits);
            if (message.assists != null && Object.hasOwnProperty.call(message, "assists"))
                writer.uint32(/* id 16, wireType 0 =*/128).uint32(message.assists);
            if (message.inventory != null && message.inventory.length)
                for (let i = 0; i < message.inventory.length; ++i)
                    $root.moba.InventorySlot.encode(message.inventory[i], writer.uint32(/* id 17, wireType 2 =*/138).fork(), q + 1).ldelim();
            if (message.abilityReadyTicks != null && message.abilityReadyTicks.length) {
                writer.uint32(/* id 18, wireType 2 =*/146).fork();
                for (let i = 0; i < message.abilityReadyTicks.length; ++i)
                    writer.uint32(message.abilityReadyTicks[i]);
                writer.ldelim();
            }
            return writer;
        };

        /**
         * Encodes the specified PlayerState message, length delimited. Does not implicitly {@link moba.PlayerState.verify|verify} messages.
         * @function encodeDelimited
         * @memberof moba.PlayerState
         * @static
         * @param {moba.IPlayerState} message PlayerState message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PlayerState.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
        };

        /**
         * Decodes a PlayerState message from the specified reader or buffer.
         * @function decode
         * @memberof moba.PlayerState
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {moba.PlayerState} PlayerState
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PlayerState.decode = function decode(reader, length, error, long) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            if (long === undefined)
                long = 0;
            if (long > $Reader.recursionLimit)
                throw Error("maximum nesting depth exceeded");
            let end, message;
            if (length === undefined)
                end = reader.len;
            else {
                end = reader.pos + length;
                if (end > reader.len)
                    throw RangeError("index out of range");
                length = reader.len;
                reader.len = end;
            }
            message = new $root.moba.PlayerState();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.index = reader.uint32();
                        break;
                    }
                case 2: {
                        message.x = reader.sint32();
                        break;
                    }
                case 3: {
                        message.y = reader.sint32();
                        break;
                    }
                case 4: {
                        message.hp = reader.uint32();
                        break;
                    }
                case 5: {
                        message.maxHp = reader.uint32();
                        break;
                    }
                case 6: {
                        message.mana = reader.uint32();
                        break;
                    }
                case 7: {
                        message.maxMana = reader.uint32();
                        break;
                    }
                case 8: {
                        message.speed = reader.uint32();
                        break;
                    }
                case 9: {
                        message.kills = reader.uint32();
                        break;
                    }
                case 10: {
                        message.deaths = reader.uint32();
                        break;
                    }
                case 11: {
                        message.lastProcessedSeq = reader.uint32();
                        break;
                    }
                case 12: {
                        message.heroId = reader.string();
                        break;
                    }
                case 13: {
                        message.gold = reader.uint32();
                        break;
                    }
                case 14: {
                        message.goldEarned = reader.uint32();
                        break;
                    }
                case 15: {
                        message.lastHits = reader.uint32();
                        break;
                    }
                case 16: {
                        message.assists = reader.uint32();
                        break;
                    }
                case 17: {
                        if (!(message.inventory && message.inventory.length))
                            message.inventory = [];
                        message.inventory.push($root.moba.InventorySlot.decode(reader, reader.uint32(), undefined, long + 1));
                        break;
                    }
                case 18: {
                        if (!(message.abilityReadyTicks && message.abilityReadyTicks.length))
                            message.abilityReadyTicks = [];
                        if ((tag & 7) === 2) {
                            let end2 = reader.uint32() + reader.pos;
                            if (end2 > reader.len)
                                throw RangeError("index out of range");
                            reader.len = end2;
                            while (reader.pos < end2)
                                message.abilityReadyTicks.push(reader.uint32());
                            if (reader.pos !== end2)
                                throw RangeError("index out of range");
                            reader.len = end;
                        } else
                            message.abilityReadyTicks.push(reader.uint32());
                        break;
                    }
                default:
                    reader.skipType(tag & 7, long);
                    break;
                }
            }
            if (length !== undefined) {
                if (reader.pos !== end)
                    throw RangeError("index out of range");
                reader.len = length;
            }
            return message;
        };

        /**
         * Decodes a PlayerState message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof moba.PlayerState
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {moba.PlayerState} PlayerState
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PlayerState.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a PlayerState message.
         * @function verify
         * @memberof moba.PlayerState
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        PlayerState.verify = function verify(message, long) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (long === undefined)
                long = 0;
            if (long > $util.recursionLimit)
                return "maximum nesting depth exceeded";
            if (message.index != null && Object.hasOwnProperty.call(message, "index"))
                if (!$util.isInteger(message.index))
                    return "index: integer expected";
            if (message.x != null && Object.hasOwnProperty.call(message, "x"))
                if (!$util.isInteger(message.x))
                    return "x: integer expected";
            if (message.y != null && Object.hasOwnProperty.call(message, "y"))
                if (!$util.isInteger(message.y))
                    return "y: integer expected";
            if (message.hp != null && Object.hasOwnProperty.call(message, "hp"))
                if (!$util.isInteger(message.hp))
                    return "hp: integer expected";
            if (message.maxHp != null && Object.hasOwnProperty.call(message, "maxHp"))
                if (!$util.isInteger(message.maxHp))
                    return "maxHp: integer expected";
            if (message.mana != null && Object.hasOwnProperty.call(message, "mana"))
                if (!$util.isInteger(message.mana))
                    return "mana: integer expected";
            if (message.maxMana != null && Object.hasOwnProperty.call(message, "maxMana"))
                if (!$util.isInteger(message.maxMana))
                    return "maxMana: integer expected";
            if (message.speed != null && Object.hasOwnProperty.call(message, "speed"))
                if (!$util.isInteger(message.speed))
                    return "speed: integer expected";
            if (message.kills != null && Object.hasOwnProperty.call(message, "kills"))
                if (!$util.isInteger(message.kills))
                    return "kills: integer expected";
            if (message.deaths != null && Object.hasOwnProperty.call(message, "deaths"))
                if (!$util.isInteger(message.deaths))
                    return "deaths: integer expected";
            if (message.lastProcessedSeq != null && Object.hasOwnProperty.call(message, "lastProcessedSeq"))
                if (!$util.isInteger(message.lastProcessedSeq))
                    return "lastProcessedSeq: integer expected";
            if (message.heroId != null && Object.hasOwnProperty.call(message, "heroId"))
                if (!$util.isString(message.heroId))
                    return "heroId: string expected";
            if (message.gold != null && Object.hasOwnProperty.call(message, "gold"))
                if (!$util.isInteger(message.gold))
                    return "gold: integer expected";
            if (message.goldEarned != null && Object.hasOwnProperty.call(message, "goldEarned"))
                if (!$util.isInteger(message.goldEarned))
                    return "goldEarned: integer expected";
            if (message.lastHits != null && Object.hasOwnProperty.call(message, "lastHits"))
                if (!$util.isInteger(message.lastHits))
                    return "lastHits: integer expected";
            if (message.assists != null && Object.hasOwnProperty.call(message, "assists"))
                if (!$util.isInteger(message.assists))
                    return "assists: integer expected";
            if (message.inventory != null && Object.hasOwnProperty.call(message, "inventory")) {
                if (!Array.isArray(message.inventory))
                    return "inventory: array expected";
                for (let i = 0; i < message.inventory.length; ++i) {
                    let error = $root.moba.InventorySlot.verify(message.inventory[i], long + 1);
                    if (error)
                        return "inventory." + error;
                }
            }
            if (message.abilityReadyTicks != null && Object.hasOwnProperty.call(message, "abilityReadyTicks")) {
                if (!Array.isArray(message.abilityReadyTicks))
                    return "abilityReadyTicks: array expected";
                for (let i = 0; i < message.abilityReadyTicks.length; ++i)
                    if (!$util.isInteger(message.abilityReadyTicks[i]))
                        return "abilityReadyTicks: integer[] expected";
            }
            return null;
        };

        /**
         * Creates a PlayerState message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof moba.PlayerState
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {moba.PlayerState} PlayerState
         */
        PlayerState.fromObject = function fromObject(object, long) {
            if (object instanceof $root.moba.PlayerState)
                return object;
            if (!$util.isObject(object))
                throw TypeError(".moba.PlayerState: object expected");
            if (long === undefined)
                long = 0;
            if (long > $util.recursionLimit)
                throw Error("maximum nesting depth exceeded");
            let message = new $root.moba.PlayerState();
            if (object.index != null)
                message.index = object.index >>> 0;
            if (object.x != null)
                message.x = object.x | 0;
            if (object.y != null)
                message.y = object.y | 0;
            if (object.hp != null)
                message.hp = object.hp >>> 0;
            if (object.maxHp != null)
                message.maxHp = object.maxHp >>> 0;
            if (object.mana != null)
                message.mana = object.mana >>> 0;
            if (object.maxMana != null)
                message.maxMana = object.maxMana >>> 0;
            if (object.speed != null)
                message.speed = object.speed >>> 0;
            if (object.kills != null)
                message.kills = object.kills >>> 0;
            if (object.deaths != null)
                message.deaths = object.deaths >>> 0;
            if (object.lastProcessedSeq != null)
                message.lastProcessedSeq = object.lastProcessedSeq >>> 0;
            if (object.heroId != null)
                message.heroId = String(object.heroId);
            if (object.gold != null)
                message.gold = object.gold >>> 0;
            if (object.goldEarned != null)
                message.goldEarned = object.goldEarned >>> 0;
            if (object.lastHits != null)
                message.lastHits = object.lastHits >>> 0;
            if (object.assists != null)
                message.assists = object.assists >>> 0;
            if (object.inventory) {
                if (!Array.isArray(object.inventory))
                    throw TypeError(".moba.PlayerState.inventory: array expected");
                message.inventory = [];
                for (let i = 0; i < object.inventory.length; ++i) {
                    if (!$util.isObject(object.inventory[i]))
                        throw TypeError(".moba.PlayerState.inventory: object expected");
                    message.inventory[i] = $root.moba.InventorySlot.fromObject(object.inventory[i], long + 1);
                }
            }
            if (object.abilityReadyTicks) {
                if (!Array.isArray(object.abilityReadyTicks))
                    throw TypeError(".moba.PlayerState.abilityReadyTicks: array expected");
                message.abilityReadyTicks = [];
                for (let i = 0; i < object.abilityReadyTicks.length; ++i)
                    message.abilityReadyTicks[i] = object.abilityReadyTicks[i] >>> 0;
            }
            return message;
        };

        /**
         * Creates a plain object from a PlayerState message. Also converts values to other types if specified.
         * @function toObject
         * @memberof moba.PlayerState
         * @static
         * @param {moba.PlayerState} message PlayerState
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        PlayerState.toObject = function toObject(message, options, q) {
            if (!options)
                options = {};
            if (q === undefined)
                q = 0;
            if (q > $util.recursionLimit)
                throw Error("max depth exceeded");
            let object = {};
            if (options.arrays || options.defaults) {
                object.inventory = [];
                object.abilityReadyTicks = [];
            }
            if (options.defaults) {
                object.index = 0;
                object.x = 0;
                object.y = 0;
                object.hp = 0;
                object.maxHp = 0;
                object.mana = 0;
                object.maxMana = 0;
                object.speed = 0;
                object.kills = 0;
                object.deaths = 0;
                object.lastProcessedSeq = 0;
                object.heroId = "";
                object.gold = 0;
                object.goldEarned = 0;
                object.lastHits = 0;
                object.assists = 0;
            }
            if (message.index != null && Object.hasOwnProperty.call(message, "index"))
                object.index = message.index;
            if (message.x != null && Object.hasOwnProperty.call(message, "x"))
                object.x = message.x;
            if (message.y != null && Object.hasOwnProperty.call(message, "y"))
                object.y = message.y;
            if (message.hp != null && Object.hasOwnProperty.call(message, "hp"))
                object.hp = message.hp;
            if (message.maxHp != null && Object.hasOwnProperty.call(message, "maxHp"))
                object.maxHp = message.maxHp;
            if (message.mana != null && Object.hasOwnProperty.call(message, "mana"))
                object.mana = message.mana;
            if (message.maxMana != null && Object.hasOwnProperty.call(message, "maxMana"))
                object.maxMana = message.maxMana;
            if (message.speed != null && Object.hasOwnProperty.call(message, "speed"))
                object.speed = message.speed;
            if (message.kills != null && Object.hasOwnProperty.call(message, "kills"))
                object.kills = message.kills;
            if (message.deaths != null && Object.hasOwnProperty.call(message, "deaths"))
                object.deaths = message.deaths;
            if (message.lastProcessedSeq != null && Object.hasOwnProperty.call(message, "lastProcessedSeq"))
                object.lastProcessedSeq = message.lastProcessedSeq;
            if (message.heroId != null && Object.hasOwnProperty.call(message, "heroId"))
                object.heroId = message.heroId;
            if (message.gold != null && Object.hasOwnProperty.call(message, "gold"))
                object.gold = message.gold;
            if (message.goldEarned != null && Object.hasOwnProperty.call(message, "goldEarned"))
                object.goldEarned = message.goldEarned;
            if (message.lastHits != null && Object.hasOwnProperty.call(message, "lastHits"))
                object.lastHits = message.lastHits;
            if (message.assists != null && Object.hasOwnProperty.call(message, "assists"))
                object.assists = message.assists;
            if (message.inventory && message.inventory.length) {
                object.inventory = [];
                for (let j = 0; j < message.inventory.length; ++j)
                    object.inventory[j] = $root.moba.InventorySlot.toObject(message.inventory[j], options, q + 1);
            }
            if (message.abilityReadyTicks && message.abilityReadyTicks.length) {
                object.abilityReadyTicks = [];
                for (let j = 0; j < message.abilityReadyTicks.length; ++j)
                    object.abilityReadyTicks[j] = message.abilityReadyTicks[j];
            }
            return object;
        };

        /**
         * Converts this PlayerState to JSON.
         * @function toJSON
         * @memberof moba.PlayerState
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        PlayerState.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for PlayerState
         * @function getTypeUrl
         * @memberof moba.PlayerState
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        PlayerState.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/moba.PlayerState";
        };

        return PlayerState;
    })();

    moba.InventorySlot = (function() {

        /**
         * Properties of an InventorySlot.
         * @memberof moba
         * @interface IInventorySlot
         * @property {number|null} [itemIndex] InventorySlot itemIndex
         * @property {number|null} [readyTick] InventorySlot readyTick
         */

        /**
         * Constructs a new InventorySlot.
         * @memberof moba
         * @classdesc Represents an InventorySlot.
         * @implements IInventorySlot
         * @constructor
         * @param {moba.IInventorySlot=} [properties] Properties to set
         */
        function InventorySlot(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null && keys[i] !== "__proto__")
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * InventorySlot itemIndex.
         * @member {number} itemIndex
         * @memberof moba.InventorySlot
         * @instance
         */
        InventorySlot.prototype.itemIndex = 0;

        /**
         * InventorySlot readyTick.
         * @member {number} readyTick
         * @memberof moba.InventorySlot
         * @instance
         */
        InventorySlot.prototype.readyTick = 0;

        /**
         * Creates a new InventorySlot instance using the specified properties.
         * @function create
         * @memberof moba.InventorySlot
         * @static
         * @param {moba.IInventorySlot=} [properties] Properties to set
         * @returns {moba.InventorySlot} InventorySlot instance
         */
        InventorySlot.create = function create(properties) {
            return new InventorySlot(properties);
        };

        /**
         * Encodes the specified InventorySlot message. Does not implicitly {@link moba.InventorySlot.verify|verify} messages.
         * @function encode
         * @memberof moba.InventorySlot
         * @static
         * @param {moba.IInventorySlot} message InventorySlot message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        InventorySlot.encode = function encode(message, writer, q) {
            if (!writer)
                writer = $Writer.create();
            if (q === undefined)
                q = 0;
            if (q > $util.recursionLimit)
                throw Error("max depth exceeded");
            if (message.itemIndex != null && Object.hasOwnProperty.call(message, "itemIndex"))
                writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.itemIndex);
            if (message.readyTick != null && Object.hasOwnProperty.call(message, "readyTick"))
                writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.readyTick);
            return writer;
        };

        /**
         * Encodes the specified InventorySlot message, length delimited. Does not implicitly {@link moba.InventorySlot.verify|verify} messages.
         * @function encodeDelimited
         * @memberof moba.InventorySlot
         * @static
         * @param {moba.IInventorySlot} message InventorySlot message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        InventorySlot.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
        };

        /**
         * Decodes an InventorySlot message from the specified reader or buffer.
         * @function decode
         * @memberof moba.InventorySlot
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {moba.InventorySlot} InventorySlot
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        InventorySlot.decode = function decode(reader, length, error, long) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            if (long === undefined)
                long = 0;
            if (long > $Reader.recursionLimit)
                throw Error("maximum nesting depth exceeded");
            let end, message;
            if (length === undefined)
                end = reader.len;
            else {
                end = reader.pos + length;
                if (end > reader.len)
                    throw RangeError("index out of range");
                length = reader.len;
                reader.len = end;
            }
            message = new $root.moba.InventorySlot();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.itemIndex = reader.uint32();
                        break;
                    }
                case 2: {
                        message.readyTick = reader.uint32();
                        break;
                    }
                default:
                    reader.skipType(tag & 7, long);
                    break;
                }
            }
            if (length !== undefined) {
                if (reader.pos !== end)
                    throw RangeError("index out of range");
                reader.len = length;
            }
            return message;
        };

        /**
         * Decodes an InventorySlot message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof moba.InventorySlot
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {moba.InventorySlot} InventorySlot
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        InventorySlot.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an InventorySlot message.
         * @function verify
         * @memberof moba.InventorySlot
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        InventorySlot.verify = function verify(message, long) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (long === undefined)
                long = 0;
            if (long > $util.recursionLimit)
                return "maximum nesting depth exceeded";
            if (message.itemIndex != null && Object.hasOwnProperty.call(message, "itemIndex"))
                if (!$util.isInteger(message.itemIndex))
                    return "itemIndex: integer expected";
            if (message.readyTick != null && Object.hasOwnProperty.call(message, "readyTick"))
                if (!$util.isInteger(message.readyTick))
                    return "readyTick: integer expected";
            return null;
        };

        /**
         * Creates an InventorySlot message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof moba.InventorySlot
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {moba.InventorySlot} InventorySlot
         */
        InventorySlot.fromObject = function fromObject(object, long) {
            if (object instanceof $root.moba.InventorySlot)
                return object;
            if (!$util.isObject(object))
                throw TypeError(".moba.InventorySlot: object expected");
            if (long === undefined)
                long = 0;
            if (long > $util.recursionLimit)
                throw Error("maximum nesting depth exceeded");
            let message = new $root.moba.InventorySlot();
            if (object.itemIndex != null)
                message.itemIndex = object.itemIndex >>> 0;
            if (object.readyTick != null)
                message.readyTick = object.readyTick >>> 0;
            return message;
        };

        /**
         * Creates a plain object from an InventorySlot message. Also converts values to other types if specified.
         * @function toObject
         * @memberof moba.InventorySlot
         * @static
         * @param {moba.InventorySlot} message InventorySlot
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        InventorySlot.toObject = function toObject(message, options, q) {
            if (!options)
                options = {};
            if (q === undefined)
                q = 0;
            if (q > $util.recursionLimit)
                throw Error("max depth exceeded");
            let object = {};
            if (options.defaults) {
                object.itemIndex = 0;
                object.readyTick = 0;
            }
            if (message.itemIndex != null && Object.hasOwnProperty.call(message, "itemIndex"))
                object.itemIndex = message.itemIndex;
            if (message.readyTick != null && Object.hasOwnProperty.call(message, "readyTick"))
                object.readyTick = message.readyTick;
            return object;
        };

        /**
         * Converts this InventorySlot to JSON.
         * @function toJSON
         * @memberof moba.InventorySlot
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        InventorySlot.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for InventorySlot
         * @function getTypeUrl
         * @memberof moba.InventorySlot
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        InventorySlot.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/moba.InventorySlot";
        };

        return InventorySlot;
    })();

    moba.Snapshot = (function() {

        /**
         * Properties of a Snapshot.
         * @memberof moba
         * @interface ISnapshot
         * @property {number|null} [tick] Snapshot tick
         * @property {number|null} [status] Snapshot status
         * @property {number|null} [winnerTeam] Snapshot winnerTeam
         * @property {Array.<moba.IPlayerState>|null} [players] Snapshot players
         * @property {Array.<moba.IEffect>|null} [effects] Snapshot effects
         * @property {Array.<moba.IUnit>|null} [units] Snapshot units
         */

        /**
         * Constructs a new Snapshot.
         * @memberof moba
         * @classdesc Represents a Snapshot.
         * @implements ISnapshot
         * @constructor
         * @param {moba.ISnapshot=} [properties] Properties to set
         */
        function Snapshot(properties) {
            this.players = [];
            this.effects = [];
            this.units = [];
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null && keys[i] !== "__proto__")
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Snapshot tick.
         * @member {number} tick
         * @memberof moba.Snapshot
         * @instance
         */
        Snapshot.prototype.tick = 0;

        /**
         * Snapshot status.
         * @member {number} status
         * @memberof moba.Snapshot
         * @instance
         */
        Snapshot.prototype.status = 0;

        /**
         * Snapshot winnerTeam.
         * @member {number} winnerTeam
         * @memberof moba.Snapshot
         * @instance
         */
        Snapshot.prototype.winnerTeam = 0;

        /**
         * Snapshot players.
         * @member {Array.<moba.IPlayerState>} players
         * @memberof moba.Snapshot
         * @instance
         */
        Snapshot.prototype.players = $util.emptyArray;

        /**
         * Snapshot effects.
         * @member {Array.<moba.IEffect>} effects
         * @memberof moba.Snapshot
         * @instance
         */
        Snapshot.prototype.effects = $util.emptyArray;

        /**
         * Snapshot units.
         * @member {Array.<moba.IUnit>} units
         * @memberof moba.Snapshot
         * @instance
         */
        Snapshot.prototype.units = $util.emptyArray;

        /**
         * Creates a new Snapshot instance using the specified properties.
         * @function create
         * @memberof moba.Snapshot
         * @static
         * @param {moba.ISnapshot=} [properties] Properties to set
         * @returns {moba.Snapshot} Snapshot instance
         */
        Snapshot.create = function create(properties) {
            return new Snapshot(properties);
        };

        /**
         * Encodes the specified Snapshot message. Does not implicitly {@link moba.Snapshot.verify|verify} messages.
         * @function encode
         * @memberof moba.Snapshot
         * @static
         * @param {moba.ISnapshot} message Snapshot message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Snapshot.encode = function encode(message, writer, q) {
            if (!writer)
                writer = $Writer.create();
            if (q === undefined)
                q = 0;
            if (q > $util.recursionLimit)
                throw Error("max depth exceeded");
            if (message.tick != null && Object.hasOwnProperty.call(message, "tick"))
                writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.tick);
            if (message.status != null && Object.hasOwnProperty.call(message, "status"))
                writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.status);
            if (message.winnerTeam != null && Object.hasOwnProperty.call(message, "winnerTeam"))
                writer.uint32(/* id 3, wireType 0 =*/24).uint32(message.winnerTeam);
            if (message.players != null && message.players.length)
                for (let i = 0; i < message.players.length; ++i)
                    $root.moba.PlayerState.encode(message.players[i], writer.uint32(/* id 4, wireType 2 =*/34).fork(), q + 1).ldelim();
            if (message.effects != null && message.effects.length)
                for (let i = 0; i < message.effects.length; ++i)
                    $root.moba.Effect.encode(message.effects[i], writer.uint32(/* id 5, wireType 2 =*/42).fork(), q + 1).ldelim();
            if (message.units != null && message.units.length)
                for (let i = 0; i < message.units.length; ++i)
                    $root.moba.Unit.encode(message.units[i], writer.uint32(/* id 6, wireType 2 =*/50).fork(), q + 1).ldelim();
            return writer;
        };

        /**
         * Encodes the specified Snapshot message, length delimited. Does not implicitly {@link moba.Snapshot.verify|verify} messages.
         * @function encodeDelimited
         * @memberof moba.Snapshot
         * @static
         * @param {moba.ISnapshot} message Snapshot message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Snapshot.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
        };

        /**
         * Decodes a Snapshot message from the specified reader or buffer.
         * @function decode
         * @memberof moba.Snapshot
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {moba.Snapshot} Snapshot
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Snapshot.decode = function decode(reader, length, error, long) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            if (long === undefined)
                long = 0;
            if (long > $Reader.recursionLimit)
                throw Error("maximum nesting depth exceeded");
            let end, message;
            if (length === undefined)
                end = reader.len;
            else {
                end = reader.pos + length;
                if (end > reader.len)
                    throw RangeError("index out of range");
                length = reader.len;
                reader.len = end;
            }
            message = new $root.moba.Snapshot();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.tick = reader.uint32();
                        break;
                    }
                case 2: {
                        message.status = reader.uint32();
                        break;
                    }
                case 3: {
                        message.winnerTeam = reader.uint32();
                        break;
                    }
                case 4: {
                        if (!(message.players && message.players.length))
                            message.players = [];
                        message.players.push($root.moba.PlayerState.decode(reader, reader.uint32(), undefined, long + 1));
                        break;
                    }
                case 5: {
                        if (!(message.effects && message.effects.length))
                            message.effects = [];
                        message.effects.push($root.moba.Effect.decode(reader, reader.uint32(), undefined, long + 1));
                        break;
                    }
                case 6: {
                        if (!(message.units && message.units.length))
                            message.units = [];
                        message.units.push($root.moba.Unit.decode(reader, reader.uint32(), undefined, long + 1));
                        break;
                    }
                default:
                    reader.skipType(tag & 7, long);
                    break;
                }
            }
            if (length !== undefined) {
                if (reader.pos !== end)
                    throw RangeError("index out of range");
                reader.len = length;
            }
            return message;
        };

        /**
         * Decodes a Snapshot message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof moba.Snapshot
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {moba.Snapshot} Snapshot
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Snapshot.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Snapshot message.
         * @function verify
         * @memberof moba.Snapshot
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Snapshot.verify = function verify(message, long) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (long === undefined)
                long = 0;
            if (long > $util.recursionLimit)
                return "maximum nesting depth exceeded";
            if (message.tick != null && Object.hasOwnProperty.call(message, "tick"))
                if (!$util.isInteger(message.tick))
                    return "tick: integer expected";
            if (message.status != null && Object.hasOwnProperty.call(message, "status"))
                if (!$util.isInteger(message.status))
                    return "status: integer expected";
            if (message.winnerTeam != null && Object.hasOwnProperty.call(message, "winnerTeam"))
                if (!$util.isInteger(message.winnerTeam))
                    return "winnerTeam: integer expected";
            if (message.players != null && Object.hasOwnProperty.call(message, "players")) {
                if (!Array.isArray(message.players))
                    return "players: array expected";
                for (let i = 0; i < message.players.length; ++i) {
                    let error = $root.moba.PlayerState.verify(message.players[i], long + 1);
                    if (error)
                        return "players." + error;
                }
            }
            if (message.effects != null && Object.hasOwnProperty.call(message, "effects")) {
                if (!Array.isArray(message.effects))
                    return "effects: array expected";
                for (let i = 0; i < message.effects.length; ++i) {
                    let error = $root.moba.Effect.verify(message.effects[i], long + 1);
                    if (error)
                        return "effects." + error;
                }
            }
            if (message.units != null && Object.hasOwnProperty.call(message, "units")) {
                if (!Array.isArray(message.units))
                    return "units: array expected";
                for (let i = 0; i < message.units.length; ++i) {
                    let error = $root.moba.Unit.verify(message.units[i], long + 1);
                    if (error)
                        return "units." + error;
                }
            }
            return null;
        };

        /**
         * Creates a Snapshot message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof moba.Snapshot
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {moba.Snapshot} Snapshot
         */
        Snapshot.fromObject = function fromObject(object, long) {
            if (object instanceof $root.moba.Snapshot)
                return object;
            if (!$util.isObject(object))
                throw TypeError(".moba.Snapshot: object expected");
            if (long === undefined)
                long = 0;
            if (long > $util.recursionLimit)
                throw Error("maximum nesting depth exceeded");
            let message = new $root.moba.Snapshot();
            if (object.tick != null)
                message.tick = object.tick >>> 0;
            if (object.status != null)
                message.status = object.status >>> 0;
            if (object.winnerTeam != null)
                message.winnerTeam = object.winnerTeam >>> 0;
            if (object.players) {
                if (!Array.isArray(object.players))
                    throw TypeError(".moba.Snapshot.players: array expected");
                message.players = [];
                for (let i = 0; i < object.players.length; ++i) {
                    if (!$util.isObject(object.players[i]))
                        throw TypeError(".moba.Snapshot.players: object expected");
                    message.players[i] = $root.moba.PlayerState.fromObject(object.players[i], long + 1);
                }
            }
            if (object.effects) {
                if (!Array.isArray(object.effects))
                    throw TypeError(".moba.Snapshot.effects: array expected");
                message.effects = [];
                for (let i = 0; i < object.effects.length; ++i) {
                    if (!$util.isObject(object.effects[i]))
                        throw TypeError(".moba.Snapshot.effects: object expected");
                    message.effects[i] = $root.moba.Effect.fromObject(object.effects[i], long + 1);
                }
            }
            if (object.units) {
                if (!Array.isArray(object.units))
                    throw TypeError(".moba.Snapshot.units: array expected");
                message.units = [];
                for (let i = 0; i < object.units.length; ++i) {
                    if (!$util.isObject(object.units[i]))
                        throw TypeError(".moba.Snapshot.units: object expected");
                    message.units[i] = $root.moba.Unit.fromObject(object.units[i], long + 1);
                }
            }
            return message;
        };

        /**
         * Creates a plain object from a Snapshot message. Also converts values to other types if specified.
         * @function toObject
         * @memberof moba.Snapshot
         * @static
         * @param {moba.Snapshot} message Snapshot
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Snapshot.toObject = function toObject(message, options, q) {
            if (!options)
                options = {};
            if (q === undefined)
                q = 0;
            if (q > $util.recursionLimit)
                throw Error("max depth exceeded");
            let object = {};
            if (options.arrays || options.defaults) {
                object.players = [];
                object.effects = [];
                object.units = [];
            }
            if (options.defaults) {
                object.tick = 0;
                object.status = 0;
                object.winnerTeam = 0;
            }
            if (message.tick != null && Object.hasOwnProperty.call(message, "tick"))
                object.tick = message.tick;
            if (message.status != null && Object.hasOwnProperty.call(message, "status"))
                object.status = message.status;
            if (message.winnerTeam != null && Object.hasOwnProperty.call(message, "winnerTeam"))
                object.winnerTeam = message.winnerTeam;
            if (message.players && message.players.length) {
                object.players = [];
                for (let j = 0; j < message.players.length; ++j)
                    object.players[j] = $root.moba.PlayerState.toObject(message.players[j], options, q + 1);
            }
            if (message.effects && message.effects.length) {
                object.effects = [];
                for (let j = 0; j < message.effects.length; ++j)
                    object.effects[j] = $root.moba.Effect.toObject(message.effects[j], options, q + 1);
            }
            if (message.units && message.units.length) {
                object.units = [];
                for (let j = 0; j < message.units.length; ++j)
                    object.units[j] = $root.moba.Unit.toObject(message.units[j], options, q + 1);
            }
            return object;
        };

        /**
         * Converts this Snapshot to JSON.
         * @function toJSON
         * @memberof moba.Snapshot
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Snapshot.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Snapshot
         * @function getTypeUrl
         * @memberof moba.Snapshot
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Snapshot.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/moba.Snapshot";
        };

        return Snapshot;
    })();

    return moba;
})();

export { $root as default };
