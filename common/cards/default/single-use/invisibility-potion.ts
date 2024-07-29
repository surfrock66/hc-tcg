import {GameModel} from '../../../models/game-model'
import {CardComponent, ObserverComponent, StatusEffectComponent} from '../../../components'
import {flipCoin} from '../../../utils/coinFlips'
import Card from '../../base/card'
import {SingleUse} from '../../base/types'
import {singleUse} from '../../base/defaults'
import {
	InvisibilityPotionHeadsEffect,
	InvisibilityPotionTailsEffect,
} from '../../../status-effects/invisibility-potion'

class InvisibilityPotion extends Card {
	props: SingleUse = {
		...singleUse,
		id: 'invisibility_potion',
		numericId: 44,
		name: 'Invisibility Potion',
		expansion: 'default',
		rarity: 'rare',
		tokens: 0,
		description:
			"Flip a coin.\nIf heads, your opponent's next attack misses. If tails, their attack damage doubles.",
		showConfirmationModal: true,
		sidebarDescriptions: [
			{
				type: 'glossary',
				name: 'missed',
			},
		],
		log: (values) => `${values.defaultLog}, and ${values.coinFlip}`,
	}

	override onAttach(game: GameModel, component: CardComponent, observer: ObserverComponent) {
		const {player} = component

		observer.subscribe(player.hooks.onApply, () => {
			if (flipCoin(player, component)[0] === 'heads') {
				game.components
					.new(StatusEffectComponent, InvisibilityPotionHeadsEffect, component.entity)
					.apply(player.entity)
			} else {
				game.components
					.new(StatusEffectComponent, InvisibilityPotionTailsEffect, component.entity)
					.apply(player.entity)
			}
		})
	}
}

export default InvisibilityPotion
