//Import Thought and Thought models
const { Thought, User, Types } = require('../models');

//Thought functions
const thoughtController = {
    //get list of all thoughts
    getAllThoughts(req, res) {
        Thought.find({})
        .select("-__v")
        .sort({ _id: -1 })
        .then((dbThoughtData) => res.json(dbThoughtData))
        .catch((err) => {
            console.log(err);
            res.status(400).json(err);
        });
    },
    //get thought from ID
    getThoughtByID({ params }, res) {
        console.log("retrieved params", params)
        Thought.findOne({ _id: params.thoughtId})
        .select("-__v")
        .then((dbThoughtData) => {
            if (!dbThoughtData) {
                res.status(404).json({ message: "Cannot find thought with this id."});
                return;
            } res.json(dbThoughtData);
        })
        .catch((err) => {
            console.log(err);
            res.status(400).json(err);
        });
    },
    //create a new thought
    createNewThought({ params, body }, res) {
        console.log("INCOMING BODY", body)
        Thought.create(body)
        .then(({ _id }) => {
            return User.findOneAndUpdate(
                { _id: params.userId },
                { $push: { thoughts: _id } },
                { new: true }
            );
        })
        .then((dbUserData) => {
            if (!dbUserData) {
                res.status(404).json({ message: "Cannot find user with this id."});
                return;
            } res.json(dbUserData);
        })
        .catch((err) => res.json(err));
    },
    //delete an existing thought
    deleteThought({ params }, res) {
        Thought.findOneAndDelete({ _id: params.thoughtId})
        .then(deletedthought => {
            if (!deletedthought) {
                return res.status(404).json({ message: "Cannot find thought with this id."});
            } return User.findOneAndUpdate(
                { _id: params.username },
                { $pull: { thoughts: params.thoughtId } },
                { new: true }
            );
        })
        .then(dbUserData => {
            res.json(dbUserData);
        })
        .catch(err => res.json(err));
    },
    //add a new reaction
    addReaction({ params, body }, res) {
        console.log("INCOMING BODY", body)
        Thought.findOneAndUpdate(
            { _id: params.thoughtId },
            { $push: { reactions: body } },
            { new: true }
        )
        .then(dbUserData => {
            if (!dbUserData) {
                res.status(404).json({ message: 'Cannot find user with this id.' });
                return;
            }
            res.json(dbUserData);
        })
        .catch(err => res.json(err));
    },
    //delete an existing reactioin
    deleteReaction({ params }, res){
        Thought.findOneAndDelete({ _id: params.thoughtId.reactionId})
        .then(deletedreaction => {
            if (!deletedreaction) {
                return res.status(404).json({ message: "Cannot find reaction with this id."});
            } return Thought.findOneAndUpdate(
                { _id: params.thoughtId },
                { $push: { reactions: { reactionId: params.reactionId } } },
                { new: true }
            );
        })
        
        .then(dbUserData => res.json(dbUserData))
        .catch(err => res.json(err));
    }
};

//export controller
module.exports = thoughtController