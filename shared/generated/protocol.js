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
